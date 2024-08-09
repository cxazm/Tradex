package main

import (
    "fmt"
    "net/http"
    "sync"
    "time"
    "math/rand"

    "github.com/gorilla/websocket"
)

type Order struct {
    ID        int
    Side      string  // "buy" or "sell"
    Symbol    string
    Price     float64
    Quantity  int
    Timestamp time.Time
}

type OrderBook struct {
    BuyOrders  []Order
    SellOrders []Order
    mu         sync.Mutex
}

var upgrader = websocket.Upgrader{}

func (ob *OrderBook) MatchOrders() {
    ob.mu.Lock()
    defer ob.mu.Unlock()

    if len(ob.BuyOrders) > 0 && len(ob.SellOrders) > 0 {
        // Match highest buy with lowest sell
        buyOrder := ob.BuyOrders[0]
        sellOrder := ob.SellOrders[0]
        if buyOrder.Price >= sellOrder.Price {
            fmt.Printf("Matched! Buy Order: %+v with Sell Order: %+v\n", buyOrder, sellOrder)
            ob.BuyOrders = ob.BuyOrders[1:]
            ob.SellOrders = ob.SellOrders[1:]
        }
    }
}

func (ob *OrderBook) AddOrder(order Order) {
    ob.mu.Lock()
    defer ob.mu.Unlock()

    if order.Side == "buy" {
        ob.BuyOrders = append(ob.BuyOrders, order)
    } else {
        ob.SellOrders = append(ob.SellOrders, order)
    }
}

func priceWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, _ := upgrader.Upgrade(w, r, nil)
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
}

func orderWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, _ := upgrader.Upgrade(w, r, nil)
    defer conn.Close()

    orderBook := OrderBook{}

    for {
        var order Order
        err := conn.ReadJSON(&order)
        if err != nil {
            fmt.Println("Error reading JSON:", err)
            break
        }

        fmt.Printf("Received Order: %+v\n", order)
        orderBook.AddOrder(order)
        orderBook.MatchOrders()

        // send updated order book state back to client
        conn.WriteJSON(orderBook)
    }
}

func simulatePrices() (float64, float64) {
    eurusd := 1.10 + rand.Float64()*0.01
    btcusd := 30000.00 + rand.Float64()*1000.00
    return eurusd, btcusd
}

func main() {
    http.HandleFunc("/ws", priceWebSocket)
    http.HandleFunc("/order", orderWebSocket)
    http.ListenAndServe(":8080", nil)
}
