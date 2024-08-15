package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type OrderBookEntry struct {
	Price  float64 `json:"price"`
	Volume float64 `json:"volume"`
}

type OrderBook struct {
	Bids []OrderBookEntry `json:"bids"`
	Asks []OrderBookEntry `json:"asks"`
}

type OrderType string
type OrderSide string

const (
	LimitOrder  OrderType = "LIMIT"
	MarketOrder OrderType = "MARKET"

	BuyOrder  OrderSide = "BUY"
	SellOrder OrderSide = "SELL"
)

type Order struct {
	ID        int64     `json:"id"`
	Type      OrderType `json:"type"`
	Side      OrderSide `json:"side"`
	Symbol    string    `json:"symbol"`
	Quantity  float64   `json:"quantity"`
	Price     float64   `json:"price"`
	Timestamp time.Time `json:"timestamp"`
}

type Position struct {
	ID         int64     `json:"id"`
	Symbol     string    `json:"symbol"`
	Side       OrderSide `json:"side"`
	Quantity   float64   `json:"quantity"`
	EntryPrice float64   `json:"entryPrice"`
	StopLoss   float64   `json:"stopLoss"`
	TakeProfit float64   `json:"takeProfit"`
	OpenTime   time.Time `json:"openTime"`
	PnL        float64   `json:"pnl"`
}

type Candle struct {
	Timestamp int64   `json:"timestamp"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    float64 `json:"volume"`
}

type TradingEngine struct {
	symbols   map[string]float64
	positions map[int64]*Position
	candles   map[string][]*Candle
	clients   map[*websocket.Conn]bool
	mutex     sync.RWMutex
	// nextOrderID    int64
	nextPositionID int64
	orderBooks     map[string]*OrderBook
}

func NewTradingEngine() *TradingEngine {
	return &TradingEngine{
		symbols:    make(map[string]float64),
		positions:  make(map[int64]*Position),
		candles:    make(map[string][]*Candle),
		clients:    make(map[*websocket.Conn]bool),
		orderBooks: make(map[string]*OrderBook),
	}
}

func (te *TradingEngine) AddSymbol(symbol string, initialPrice float64) {
	te.mutex.Lock()
	defer te.mutex.Unlock()
	te.symbols[symbol] = initialPrice
	te.candles[symbol] = make([]*Candle, 0)
}

// opening positions
func (te *TradingEngine) OpenPosition(symbol string, side OrderSide, quantity float64, stopLoss, takeProfit float64) (*Position, error) {
	te.mutex.Lock()
	defer te.mutex.Unlock()

	price, ok := te.symbols[symbol]
	if !ok {
		return nil, fmt.Errorf("symbol not found")
	}

	te.nextPositionID++
	position := &Position{
		ID:         te.nextPositionID,
		Symbol:     symbol,
		Side:       side,
		Quantity:   quantity,
		EntryPrice: price,
		StopLoss:   stopLoss,
		TakeProfit: takeProfit,
		OpenTime:   time.Now(),
	}

	te.positions[position.ID] = position
	return position, nil
}

func (te *TradingEngine) UpdatePositions() {
	te.mutex.Lock()
	defer te.mutex.Unlock()

	for _, position := range te.positions {
		currentPrice := te.symbols[position.Symbol]
		if position.Side == BuyOrder {
			position.PnL = (currentPrice - position.EntryPrice) * position.Quantity
		} else {
			position.PnL = (position.EntryPrice - currentPrice) * position.Quantity
		}

		if (position.Side == BuyOrder && currentPrice <= position.StopLoss) ||
			(position.Side == SellOrder && currentPrice >= position.StopLoss) ||
			(position.Side == BuyOrder && currentPrice >= position.TakeProfit) ||
			(position.Side == SellOrder && currentPrice <= position.TakeProfit) {
			delete(te.positions, position.ID)
			log.Printf("Closed position: %+v", position)
		}
	}
}

// generate and update the order book
func (te *TradingEngine) UpdateOrderBook(symbol string) {
	te.mutex.Lock()
	defer te.mutex.Unlock()

	currentPrice := te.symbols[symbol]
	orderBook := &OrderBook{
		Bids: make([]OrderBookEntry, 5),
		Asks: make([]OrderBookEntry, 5),
	}

	for i := 0; i < 5; i++ {
		bidPrice := currentPrice * (1 - float64(i+1)*0.001)
		askPrice := currentPrice * (1 + float64(i+1)*0.001)

		orderBook.Bids[i] = OrderBookEntry{
			Price:  math.Round(bidPrice*100) / 100, // Round to 2 decimal places
			Volume: math.Round(rand.Float64()*1000*100) / 100,
		}
		orderBook.Asks[i] = OrderBookEntry{
			Price:  math.Round(askPrice*100) / 100,
			Volume: math.Round(rand.Float64()*1000*100) / 100,
		}
	}

	te.orderBooks[symbol] = orderBook
}

// simulate price data
func (te *TradingEngine) GenerateCandleData() {
	for symbol := range te.symbols {
		te.mutex.Lock()
		currentPrice := te.symbols[symbol]
		te.mutex.Unlock()

		candle := &Candle{
			Timestamp: time.Now().Unix(),
			Open:      currentPrice,
			High:      currentPrice * (1 + rand.Float64()*0.001),
			Low:       currentPrice * (1 - rand.Float64()*0.001),
			Close:     currentPrice * (1 + (rand.Float64()-0.5)*0.002),
			Volume:    rand.Float64() * 1000,
		}

		te.mutex.Lock()
		te.candles[symbol] = append(te.candles[symbol], candle)
		if len(te.candles[symbol]) > 100 {
			te.candles[symbol] = te.candles[symbol][1:]
		}
		te.symbols[symbol] = candle.Close
		te.mutex.Unlock()
	}
}

// ensure frontend is getting real time updates
func (te *TradingEngine) BroadcastUpdates() {
	te.mutex.RLock()
	defer te.mutex.RUnlock()

	update := struct {
		Symbols    map[string]float64    `json:"symbols"`
		Positions  []*Position           `json:"positions"`
		Candles    map[string]*Candle    `json:"candles"`
		OrderBooks map[string]*OrderBook `json:"orderBooks"`
	}{
		Symbols:    te.symbols,
		Positions:  make([]*Position, 0, len(te.positions)),
		Candles:    make(map[string]*Candle),
		OrderBooks: te.orderBooks,
	}

	for _, pos := range te.positions {
		update.Positions = append(update.Positions, pos)
	}

	for symbol, candles := range te.candles {
		if len(candles) > 0 {
			update.Candles[symbol] = candles[len(candles)-1]
		}
	}

	message, _ := json.Marshal(update)
	for client := range te.clients {
		client.WriteMessage(websocket.TextMessage, message)
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(te *TradingEngine, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	te.mutex.Lock()
	te.clients[conn] = true
	te.mutex.Unlock()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			te.mutex.Lock()
			delete(te.clients, conn)
			te.mutex.Unlock()
			return
		}

		var order struct {
			Symbol     string    `json:"symbol"`
			Side       OrderSide `json:"side"`
			Quantity   float64   `json:"quantity"`
			StopLoss   float64   `json:"stopLoss"`
			TakeProfit float64   `json:"takeProfit"`
		}

		if err := json.Unmarshal(message, &order); err != nil {
			log.Println(err)
			continue
		}

		position, err := te.OpenPosition(order.Symbol, order.Side, order.Quantity, order.StopLoss, order.TakeProfit)
		if err != nil {
			log.Println(err)
			continue
		}

		log.Printf("Opened position: %+v", position)
	}
}

func main() {
	te := NewTradingEngine()
	te.AddSymbol("BTCUSD", 50000)
	te.AddSymbol("ETHUSD", 3000)

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		for range ticker.C {
			te.GenerateCandleData()
			te.UpdatePositions()
			for symbol := range te.symbols {
				te.UpdateOrderBook(symbol)
			}
			te.BroadcastUpdates()
		}
	}()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(te, w, r)
	})

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
	log.Println("Server is running on :8080")
}
