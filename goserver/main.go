package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
)

type Config struct {
    Directory string `json:"directory"`
    Port      string `json:"port"`
}

var version string
var commit string
var date string
var builtBy string

func main() {
    log.Printf("构建时间: %s", date)
    log.Printf("构建commit: %s", commit)
    log.Printf("构建version: %s", version)
    if len(os.Args) < 2 {
        log.Fatal("请提供配置文件路径作为第一个参数")
    }
    configFilePath := os.Args[1]
    log.Printf("读取配置文件: %s", configFilePath)

    // 读取配置文件
    file, err := os.Open(configFilePath)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()

    var config Config
    decoder := json.NewDecoder(file)
    err = decoder.Decode(&config)
    if err != nil {
        log.Fatal(err)
    }

    // 设置要读取的目录
    fs := http.FileServer(http.Dir(config.Directory))

    // 配置路由
    http.Handle("/", fs)
    address := "localhost:" + config.Port
    // 启动服务器
    log.Printf("Listening on http://%s", address)
    err = http.ListenAndServe(address, nil)
    if err != nil {
        log.Fatal(err)
    }
}