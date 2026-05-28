package main

import (
	"log"

	"sku-rumahsakit/startup"
)

func main() {
	log.Println("Starting SKU Rumah Sakit BE server...")
	startup.Server()
}
