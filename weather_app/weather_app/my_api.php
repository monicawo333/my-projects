<?php

header('Content-Type: application/json');

// 🔒 your API key
$API_KEY = "14cc08d81c32589c1e9392ca259e8396";

// Get city
if (!isset($_GET['city']) || empty($_GET['city'])) {
    echo json_encode(["error" => "City is required"]);
    exit;
}

$city = urlencode($_GET['city']);

// Call OpenWeather API
$url = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$API_KEY}&units=metric";

$response = file_get_contents($url);

// ❗ handle failed request
if ($response === FALSE) {
    echo json_encode(["error" => "Failed to fetch weather"]);
    exit;
}

$data = json_decode($response, true);

// ❗ API error (city not found etc.)
if ($data["cod"] != 200) {
    echo json_encode(["error" => $data["message"]]);
    exit;
}

// ✅ Return EXACT structure your JS expects
echo json_encode([
    "city" => $data["name"],
    "weather_temperature" => $data["main"]["temp"],
    "weather_description" => $data["weather"][0]["description"],
    "humidity" => $data["main"]["humidity"],
    "timestamp" => date("Y-m-d H:i:s")
]);