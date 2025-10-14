<?php

ob_start();

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: 0");

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit;
}

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    if ($method === 'POST') {
        // Add new faculty
        $name = $input['name'] ?? null;
        $department = $input['department'] ?? null;
        $courses = $input['courses_taught'] ?? null;
        $expertise = $input['expertise'] ?? null;
        $interests = $input['interests'] ?? null;
        $contact = $input['contact'] ?? null;

        if (!$name || !$department || !$courses) {
            http_response_code(400);
            echo json_encode(['error' => 'name, department, and courses_taught are required']);
            ob_end_flush();
            exit;
        }

        $stmt = $pdo->prepare(
            "INSERT INTO faculty (name, department, courses_taught, expertise, interests, contact)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$name, $department, $courses, $expertise, $interests, $contact]);

        http_response_code(201);
        echo json_encode(['message' => 'Faculty member added successfully']);
        ob_end_flush();
        exit;

    } elseif ($method === 'GET') {
        // Get faculty (with optional search filters)
        $conditions = [];
        $params = [];

        if (isset($_GET['name']) && $_GET['name'] !== '') {
            $conditions[] = "name LIKE ?";
            $params[] = "%" . $_GET['name'] . "%";
        }

        if (isset($_GET['department']) && $_GET['department'] !== '') {
            $conditions[] = "department LIKE ?";
            $params[] = "%" . $_GET['department'] . "%";
        }

        if (isset($_GET['courses_taught']) && $_GET['courses_taught'] !== '') {
            $conditions[] = "courses_taught LIKE ?";
            $params[] = "%" . $_GET['courses_taught'] . "%";
        }

        if (isset($_GET['expertise']) && $_GET['expertise'] !== '') {
            $conditions[] = "expertise LIKE ?";
            $params[] = "%" . $_GET['expertise'] . "%";
        }

        $sql = "SELECT * FROM faculty";
        if ($conditions) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        ob_end_flush();
        exit;

    } elseif ($method === 'DELETE') {
        // Delete a faculty by ID
        // Expected: DELETE http://localhost/my-api/faculty.php?id=3
        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faculty ID is required for deletion']);
            ob_end_flush();
            exit;
        }

        $id = intval($_GET['id']);

        // Check if faculty exists
        $check = $pdo->prepare("SELECT id FROM faculty WHERE id = ?");
        $check->execute([$id]);
        if ($check->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Faculty not found']);
            ob_end_flush();
            exit;
        }

        // Delete faculty
        $stmt = $pdo->prepare("DELETE FROM faculty WHERE id = ?");
        $stmt->execute([$id]);

        http_response_code(200);
        echo json_encode(['message' => 'Faculty deleted successfully']);
        ob_end_flush();
        exit;

        } elseif ($method === 'PUT') {
        // Update a faculty member by ID
        // Expected: PUT http://localhost/my-api/faculty.php?id=3
        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faculty ID is required for update']);
            ob_end_flush();
            exit;
        }

        $id = intval($_GET['id']);

        // Get input data
        $name = $input['name'] ?? null;
        $department = $input['department'] ?? null;
        $courses = $input['courses_taught'] ?? null;
        $expertise = $input['expertise'] ?? null;
        $interests = $input['interests'] ?? null;
        $contact = $input['contact'] ?? null;

        // Validate required fields
        if (!$name || !$department || !$courses) {
            http_response_code(400);
            echo json_encode(['error' => 'name, department, and courses_taught are required']);
            ob_end_flush();
            exit;
        }

        // Check if faculty exists
        $check = $pdo->prepare("SELECT id FROM faculty WHERE id = ?");
        $check->execute([$id]);
        if ($check->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Faculty not found']);
            ob_end_flush();
            exit;
        }

        // Update faculty
        $stmt = $pdo->prepare("
            UPDATE faculty
            SET name = ?, department = ?, courses_taught = ?, expertise = ?, interests = ?, contact = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $department, $courses, $expertise, $interests, $contact, $id]);

        http_response_code(200);
        echo json_encode(['message' => 'Faculty updated successfully']);
        ob_end_flush();
        exit;
    }
    else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        ob_end_flush();
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    ob_end_flush();
    exit;
} finally {
    $pdo = null;
}
