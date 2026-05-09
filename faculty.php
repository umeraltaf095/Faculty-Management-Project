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

// Helper function to handle image upload
function handleImageUpload() {
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/';
        
        // Create uploads directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Generate a unique filename
        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('faculty_') . '.' . $fileExtension;
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            // Adjust this to match your actual domain/localhost path structure
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $domain = $_SERVER['HTTP_HOST'];
            $baseDir = dirname($_SERVER['SCRIPT_NAME']);
            $baseDir = $baseDir === '/' ? '' : $baseDir;
            
            return $protocol . "://" . $domain . $baseDir . "/uploads/" . $fileName;
        }
    }
    return null;
}

// Detect true method (FormData updates are sent via POST with _method=PUT)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT') {
    $method = 'PUT';
}

try {

    /* -----------------------------------
       POST → ADD NEW FACULTY
    ----------------------------------- */
    if ($method === 'POST') {

        $name          = trim($_POST['name'] ?? '');
        $department_id = isset($_POST['department_id']) ? intval($_POST['department_id']) : null;
        $courses       = trim($_POST['courses_taught'] ?? '');
        $expertise     = trim($_POST['expertise'] ?? '');
        $interests     = trim($_POST['interests'] ?? '');
        $contact       = trim($_POST['contact'] ?? '');
        
        // Handle file upload
        $image_url = handleImageUpload();

        if ($name === '' || !$department_id || $courses === '') {
            http_response_code(400);
            echo json_encode(['error' => 'name, department_id, and courses_taught are required']);
            exit;
        }

        $deptCheck = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
        $deptCheck->execute([$department_id]);
        if ($deptCheck->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Department not found']);
            exit;
        }

        if ($contact !== '') {
            $check = $pdo->prepare("SELECT id FROM faculty WHERE contact = ?");
            $check->execute([$contact]);
            if ($check->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Contact already exists']);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO faculty (name, department_id, courses_taught, expertise, interests, contact, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $department_id, $courses, $expertise ?: null, $interests ?: null, $contact ?: null, $image_url]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Faculty member added successfully',
            'id'      => (int) $pdo->lastInsertId()
        ]);
        exit;
    }

    /* -----------------------------------
       GET → FETCH FACULTY
    ----------------------------------- */
    elseif ($method === 'GET') {
        $conditions = [];
        $params     = [];

        if (isset($_GET['id']) && is_numeric($_GET['id'])) {
            $conditions[] = "f.id = ?";
            $params[]     = intval($_GET['id']);
        }

        if (isset($_GET['name']) && $_GET['name'] !== '') {
            $conditions[] = "f.name LIKE ?";
            $params[]     = "%" . $_GET['name'] . "%";
        }

        if (isset($_GET['department_id']) && is_numeric($_GET['department_id'])) {
            $conditions[] = "f.department_id = ?";
            $params[]     = intval($_GET['department_id']);
        }

        if (isset($_GET['courses_taught']) && $_GET['courses_taught'] !== '') {
            $conditions[] = "f.courses_taught LIKE ?";
            $params[]     = "%" . $_GET['courses_taught'] . "%";
        }

        if (isset($_GET['expertise']) && $_GET['expertise'] !== '') {
            $conditions[] = "f.expertise LIKE ?";
            $params[]     = "%" . $_GET['expertise'] . "%";
        }

        $sql = "
            SELECT
                f.id,
                f.name,
                f.department_id,
                d.department   AS department_name,
                f.courses_taught,
                f.expertise,
                f.interests,
                f.contact,
                f.image_url
            FROM faculty f
            LEFT JOIN departments d ON f.department_id = d.id
        ";

        if ($conditions) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        $sql .= " ORDER BY f.id ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $rows = array_map(function ($row) {
            $row['id']            = (int) $row['id'];
            $row['department_id'] = (int) $row['department_id'];
            return $row;
        }, $rows);

        echo json_encode($rows);
        exit;
    }

    /* -----------------------------------
       PUT → UPDATE FACULTY (Sent via POST with _method=PUT)
    ----------------------------------- */
    elseif ($method === 'PUT') {

        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faculty ID is required for update']);
            exit;
        }

        $id            = intval($_GET['id']);
        $name          = trim($_POST['name'] ?? '');
        $department_id = isset($_POST['department_id']) ? intval($_POST['department_id']) : null;
        $courses       = trim($_POST['courses_taught'] ?? '');
        $expertise     = trim($_POST['expertise'] ?? '');
        $interests     = trim($_POST['interests'] ?? '');
        $contact       = trim($_POST['contact'] ?? '');

        if ($name === '' || !$department_id || $courses === '') {
            http_response_code(400);
            echo json_encode(['error' => 'name, department_id, and courses_taught are required']);
            exit;
        }

        $exist = $pdo->prepare("SELECT id, image_url FROM faculty WHERE id = ?");
        $exist->execute([$id]);
        if ($exist->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Faculty not found']);
            exit;
        }
        
        $currentRecord = $exist->fetch(PDO::FETCH_ASSOC);

        $deptCheck = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
        $deptCheck->execute([$department_id]);
        if ($deptCheck->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Department not found']);
            exit;
        }

        if ($contact !== '') {
            $check = $pdo->prepare("SELECT id FROM faculty WHERE contact = ? AND id != ?");
            $check->execute([$contact, $id]);
            if ($check->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Contact already exists']);
                exit;
            }
        }

        // Handle file upload if a new image was provided
        $new_image_url = handleImageUpload();
        
        // If no new image was uploaded, retain the existing one
        $image_url_to_save = $new_image_url ? $new_image_url : $currentRecord['image_url'];

        $stmt = $pdo->prepare("
            UPDATE faculty
            SET name = ?, department_id = ?, courses_taught = ?, expertise = ?, interests = ?, contact = ?, image_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $department_id, $courses, $expertise ?: null, $interests ?: null, $contact ?: null, $image_url_to_save, $id]);

        http_response_code(200);
        echo json_encode(['message' => 'Faculty updated successfully']);
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
