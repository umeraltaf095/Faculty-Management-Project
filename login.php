<?php

header("Access-Control-Allow-Origin: http://127.0.0.1:5500"); // allow frontend origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");   // allowed methods
header("Access-Control-Allow-Headers: Content-Type");         // allow Content-Type header

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}




require 'db.php'; 

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Both email and password are required']);
    exit;
}


$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
$stmt->execute([$email, $password]);
$user = $stmt->fetch();

if ($user) {
    echo json_encode(['success' => true, 'message' => 'Admin logged in successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Email or Password']);
}
?>