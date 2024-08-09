package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Order represents a trade order
type Order struct {
	ID        int
	Side      string // "buy" or "sell"
	Symbol    string
	Price     float64
	Quantity  int
	Timestamp time.Time
}

// Order book represents the order book
type OrderBook struct {
	BuyOrders  []*Order
	SellOrders []*Order
	mu         sync.RWMutex
}

// New order book to return a new order book
func NewOrderBook() *OrderBook {
	return &OrderBook{
		BuyOrders:  make([]*Order, 0),
		SellOrders: make([]*Order, 0),
	}
}

// Add order to the order book
func (ob *OrderBook) AddOrder(order *Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	if order.Side == "buy" {
		ob.BuyOrders = append(ob.BuyOrders, order)
	} else {
		ob.SellOrders = append(ob.SellOrders, order)
	}
}

// Match orders buy and sell orders
func (ob *OrderBook) MatchOrders() {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	for len(ob.BuyOrders) > 0 && len(ob.SellOrders) > 0 {
		buyOrder := ob.BuyOrders[0]
		sellOrder := ob.SellOrders[0]

		if buyOrder.Price >= sellOrder.Price {
			// Execute trade
			fmt.Printf("Trade executed: %+v\n", buyOrder)
			ob.BuyOrders = ob.BuyOrders[1:]
			ob.SellOrders = ob.SellOrders[1:]
		} else {
			break
		}
	}
}

// returns the current orders in the order book
func (ob *OrderBook) GetOrders() ([]*Order, []*Order) {
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	return ob.BuyOrders, ob.SellOrders
}

func simulatePrices() (bid float64, ask float64) {
	// Random walk parameters
	mu := 0.0001  // mean
	sigma := 0.01 // standard deviation
	dt := 1.0     // time step

	// Previous prices
	prevBid := 1.1000
	prevAsk := 1.1010

	// Random walk
	bid = prevBid + mu*dt + sigma*rand.NormFloat64()
	ask = prevAsk + mu*dt + sigma*rand.NormFloat64()

	return bid, ask
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	fmt.Println("Starting server...")

	orderBook := NewOrderBook()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("Error upgrading WebSocket connection:", err)
			return
		}
		defer conn.Close()

		for {
			eurusd, btcusd := simulatePrices()
			data := map[string]float64{
				"EURUSD": eurusd,
				"BTCUSD": btcusd,
			}
			conn.WriteJSON(data)
			time.Sleep(1 * time.Second)
		}
	})

	http.HandleFunc("/order", func(w http.ResponseWriter, r *http.Request) {
		var order Order
		err := json.NewDecoder(r.Body).Decode(&order)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		orderBook.AddOrder(&order)
		orderBook.MatchOrders()

		buyOrders, sellOrders := orderBook.GetOrders()
		data := map[string]interface{}{
			"buyOrders":  buyOrders,
			"sellOrders": sellOrders,
		}
		json.NewEncoder(w).Encode(data)
	})
	fmt.Println("Server listening on port 8080...")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
