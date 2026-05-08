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
$input  = json_decode(file_get_contents('php://input'), true);

try {

    /* -----------------------------------
       POST → ADD NEW DEPARTMENT
    ----------------------------------- */
    if ($method === 'POST') {

        $department = trim($input['department'] ?? '');

        if ($department === '') {
            http_response_code(400);
            echo json_encode(['error' => 'department name is required']);
            exit;
        }

        // Check for duplicate department name
        $check = $pdo->prepare("SELECT id FROM departments WHERE department = ?");
        $check->execute([$department]);

        if ($check->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Department already exists']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO departments (department) VALUES (?)");
        $stmt->execute([$department]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Department added successfully',
            'id'      => (int) $pdo->lastInsertId()
        ]);
        exit;
    }

    /* -----------------------------------
       GET → FETCH DEPARTMENTS
       - All:       GET /department.php
       - By ID:     GET /department.php?id=5
       - By name:   GET /department.php?department=CS
    ----------------------------------- */
    elseif ($method === 'GET') {

        $conditions = [];
        $params     = [];

        if (isset($_GET['id']) && is_numeric($_GET['id'])) {
            $conditions[] = "id = ?";
            $params[]     = intval($_GET['id']);
        }

        if (isset($_GET['department']) && $_GET['department'] !== '') {
            $conditions[] = "department LIKE ?";
            $params[]     = "%" . $_GET['department'] . "%";
        }

        $sql = "SELECT * FROM departments";
        if ($conditions) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        $sql .= " ORDER BY id ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Cast id to int for clean JSON output
        $rows = array_map(function ($row) {
            $row['id'] = (int) $row['id'];
            return $row;
        }, $rows);

        echo json_encode($rows);
        exit;
    }

    /* -----------------------------------
       PUT → UPDATE DEPARTMENT
       URL: PUT /department.php?id=5
    ----------------------------------- */
    elseif ($method === 'PUT') {

        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Department ID is required for update']);
            exit;
        }

        $id         = intval($_GET['id']);
        $department = trim($input['department'] ?? '');

        if ($department === '') {
            http_response_code(400);
            echo json_encode(['error' => 'department name is required']);
            exit;
        }

        // Ensure the record exists
        $check = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
        $check->execute([$id]);
        if ($check->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Department not found']);
            exit;
        }

        // Check duplicate name (excluding current record)
        $dup = $pdo->prepare("SELECT id FROM departments WHERE department = ? AND id != ?");
        $dup->execute([$department, $id]);
        if ($dup->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Another department with this name already exists']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE departments SET department = ? WHERE id = ?");
        $stmt->execute([$department, $id]);

        http_response_code(200);
        echo json_encode(['message' => 'Department updated successfully']);
        exit;
    }

    /* -----------------------------------
       DELETE → DELETE DEPARTMENT
       URL: DELETE /department.php?id=5
    ----------------------------------- */
    elseif ($method === 'DELETE') {

        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Department ID is required for deletion']);
            exit;
        }

        $id = intval($_GET['id']);

        // Ensure the record exists
        $check = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
        $check->execute([$id]);
        if ($check->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Department not found']);
            exit;
        }

        // Prevent deletion if faculty are still linked
        $linked = $pdo->prepare("SELECT id FROM faculty WHERE department_id = ?");
        $linked->execute([$id]);
        if ($linked->rowCount() > 0) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Cannot delete department: ' . $linked->rowCount() . ' faculty member(s) are still assigned to it'
            ]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
        $stmt->execute([$id]);

        http_response_code(200);
        echo json_encode(['message' => 'Department deleted successfully']);
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
