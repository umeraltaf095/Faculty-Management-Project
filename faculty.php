<?php

ob_start();

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: 0");

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit;
}

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {

    /* -----------------------------------
       POST → ADD NEW FACULTY
    ----------------------------------- */
    if ($method === 'POST') {

        $name       = $input['name'] ?? null;
        $department = $input['department'] ?? null;
        $courses    = $input['courses_taught'] ?? null;
        $expertise  = $input['expertise'] ?? null;
        $interests  = $input['interests'] ?? null;
        $contact    = $input['contact'] ?? null;

        if (!$name || !$department || !$courses) {
            http_response_code(400);
            echo json_encode(['error' => 'name, department, and courses_taught are required']);
            exit;
        }

        // 🔍 CHECK IF EMAIL ALREADY EXISTS
        if ($contact) {
            $check = $pdo->prepare("SELECT id FROM faculty WHERE contact = ?");
            $check->execute([$contact]);

            if ($check->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Contact already exists']);
                exit;
            }
        }

        // Insert new faculty
        $stmt = $pdo->prepare("
            INSERT INTO faculty (name, department, courses_taught, expertise, interests, contact)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $department, $courses, $expertise, $interests, $contact]);

        http_response_code(201);
        echo json_encode(['message' => 'Faculty member added successfully']);
        exit;
    }

    /* -----------------------------------
       GET → FETCH FACULTY
    ----------------------------------- */
    elseif ($method === 'GET') {
        // (Your GET code remains same)
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
        if ($conditions) $sql .= " WHERE " . implode(" AND ", $conditions);

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    /* -----------------------------------
       DELETE → DELETE FACULTY
    ----------------------------------- */
    elseif ($method === 'DELETE') {
        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faculty ID is required for deletion']);
            exit;
        }

        $id = intval($_GET['id']);

        $check = $pdo->prepare("SELECT id FROM faculty WHERE id = ?");
        $check->execute([$id]);

        if ($check->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Faculty not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM faculty WHERE id = ?");
        $stmt->execute([$id]);

        http_response_code(200);
        echo json_encode(['message' => 'Faculty deleted successfully']);
        exit;
    }

    /* -----------------------------------
       PUT → UPDATE FACULTY
    ----------------------------------- */
    elseif ($method === 'PUT') {

        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faculty ID is required for update']);
            exit;
        }

        $id = intval($_GET['id']);

        $name       = $input['name'] ?? null;
        $department = $input['department'] ?? null;
        $courses    = $input['courses_taught'] ?? null;
        $expertise  = $input['expertise'] ?? null;
        $interests  = $input['interests'] ?? null;
        $contact    = $input['contact'] ?? null;

        if (!$name || !$department || !$courses) {
            http_response_code(400);
            echo json_encode(['error' => 'name, department, and courses_taught are required']);
            exit;
        }

        // 🔍 CHECK IF CONTACT ALREADY EXISTS FOR ANOTHER FACULTY
        if ($contact) {
            $check = $pdo->prepare("SELECT id FROM faculty WHERE contact = ? AND id != ?");
            $check->execute([$contact, $id]);

            if ($check->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Contact already exists']);
                exit;
            }
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
        exit;
    }

    else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
} finally {
    $pdo = null;
}
