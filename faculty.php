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
       POST → ADD NEW FACULTY
       Body: { name, department_id, courses_taught, expertise, interests, contact, image_url }
       Note: image_url should be a fully-qualified URL to the image (only the link is stored in DB)
    ----------------------------------- */
    if ($method === 'POST') {

        $name          = trim($input['name'] ?? '');
        $department_id = isset($input['department_id']) ? intval($input['department_id']) : null;
        $courses       = trim($input['courses_taught'] ?? '');
        $expertise     = trim($input['expertise'] ?? '');
        $interests     = trim($input['interests'] ?? '');
        $contact       = trim($input['contact'] ?? '');
        $image_url     = trim($input['image_url'] ?? '');

        if ($name === '' || !$department_id || $courses === '') {
            http_response_code(400);
            echo json_encode(['error' => 'name, department_id, and courses_taught are required']);
            exit;
        }

        // Validate image_url format (must be a valid URL if provided)
        if ($image_url !== '' && !filter_var($image_url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(['error' => 'image_url must be a valid URL (e.g. https://example.com/photo.jpg)']);
            exit;
        }

        // Validate department exists
        $deptCheck = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
        $deptCheck->execute([$department_id]);
        if ($deptCheck->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Department not found']);
            exit;
        }

        // Check duplicate contact
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
        $stmt->execute([$name, $department_id, $courses, $expertise ?: null, $interests ?: null, $contact ?: null, $image_url ?: null]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Faculty member added successfully',
            'id'      => (int) $pdo->lastInsertId()
        ]);
        exit;
    }

    /* -----------------------------------
       GET → FETCH FACULTY (with department name via JOIN)
       Filters: ?name=&department_id=&courses_taught=&expertise=
       Single:  ?id=5
       Returns image_url in each record
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

        // Cast numeric fields
        $rows = array_map(function ($row) {
            $row['id']            = (int) $row['id'];
            $row['department_id'] = (int) $row['department_id'];
            return $row;
        }, $rows);

        echo json_encode($rows);
        exit;
    }

    /* -----------------------------------
       PUT → UPDATE FACULTY
       URL:  PUT /faculty.php?id=5
       Body: { name, department_id, courses_taught, expertise, interests, contact, image_url }
       Note: image_url should be a fully-qualified URL to the image (only the link is stored in DB)
    ----------------------------------- */
    elseif ($method === 'PUT') {

        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faculty ID is required for update']);
            exit;
        }

        $id            = intval($_GET['id']);
        $name          = trim($input['name'] ?? '');
        $department_id = isset($input['department_id']) ? intval($input['department_id']) : null;
        $courses       = trim($input['courses_taught'] ?? '');
        $expertise     = trim($input['expertise'] ?? '');
        $interests     = trim($input['interests'] ?? '');
        $contact       = trim($input['contact'] ?? '');
        $image_url     = trim($input['image_url'] ?? '');

        if ($name === '' || !$department_id || $courses === '') {
            http_response_code(400);
            echo json_encode(['error' => 'name, department_id, and courses_taught are required']);
            exit;
        }

        // Validate image_url format (must be a valid URL if provided)
        if ($image_url !== '' && !filter_var($image_url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(['error' => 'image_url must be a valid URL (e.g. https://example.com/photo.jpg)']);
            exit;
        }

        // Ensure faculty exists
        $exist = $pdo->prepare("SELECT id FROM faculty WHERE id = ?");
        $exist->execute([$id]);
        if ($exist->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Faculty not found']);
            exit;
        }

        // Validate department exists
        $deptCheck = $pdo->prepare("SELECT id FROM departments WHERE id = ?");
        $deptCheck->execute([$department_id]);
        if ($deptCheck->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Department not found']);
            exit;
        }

        // Check duplicate contact (excluding current record)
        if ($contact !== '') {
            $check = $pdo->prepare("SELECT id FROM faculty WHERE contact = ? AND id != ?");
            $check->execute([$contact, $id]);
            if ($check->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Contact already exists']);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            UPDATE faculty
            SET name = ?, department_id = ?, courses_taught = ?, expertise = ?, interests = ?, contact = ?, image_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $department_id, $courses, $expertise ?: null, $interests ?: null, $contact ?: null, $image_url ?: null, $id]);

        http_response_code(200);
        echo json_encode(['message' => 'Faculty updated successfully']);
        exit;
    }

    /* -----------------------------------
       DELETE → DELETE FACULTY
       URL: DELETE /faculty.php?id=5
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
