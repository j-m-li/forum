<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

require_once 'utils.php';

// Directory to store challenge files (make sure it's writable!)
$challengeDir = "$dataDir/slidecaptcha/";
define('SLIDE_WIDTH', 280);
define('HANDLE_WIDTH', 38);
define('TOLERANCE', 10);

// Ensure challenge dir exists
if (!is_dir($challengeDir)) mkdir($challengeDir, 0700, true);

// Clean up old challenges (older than 30 min)
foreach (glob($challengeDir . "challenge_*.json") as $file) {
    if (filemtime($file) < time() - 1800) @unlink($file);
}

function generate_id($length=32) {
    return bin2hex(random_bytes($length/2));
}

// GET = create challenge
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['get'])) {
    $id = generate_id();
    $target = rand(SLIDE_WIDTH - HANDLE_WIDTH - TOLERANCE, SLIDE_WIDTH - HANDLE_WIDTH);
    $data = [
        'target' => $target,
        'verified' => false,
        'used' => false,
        'ts' => time()
    ];
    file_put_contents($challengeDir . "challenge_$id.json", json_encode($data));
    echo json_encode(['id'=>$id, 'width'=>SLIDE_WIDTH]);
    exit;
}

// POST = validate challenge
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $headers = getallheaders();
    $id = null;
    foreach ($headers as $name => $value) {
        if (!strcasecmp($name, "x-slide-captcha-id")) {
	    $id = $value;
        }
    }

    if ($id === null) {
	http_response_code(400);
        echo json_encode(['ok'=>false, 'error'=>'missingId']);
	exit;
    }
    $body = json_decode(file_get_contents('php://input'), true);
    $pos = isset($body['pos']) ? intval($body['pos']) : null;
    if ($pos === null) {
        http_response_code(400);
        echo json_encode(['ok'=>false, 'error'=>'captchaIncorrect']);
        exit;
    }
    $file = $challengeDir . "challenge_$id.json";
    if (!file_exists($file)) { echo json_encode(['ok'=>false]); exit; }
    $data = json_decode(file_get_contents($file), true);
    if ($data['used']) { echo json_encode(['ok'=>false]); exit; }
    if (abs($pos - $data['target']) <= TOLERANCE) {
        $data['verified'] = true;
        file_put_contents($file, json_encode($data));
        echo json_encode(['ok'=>true]);
    } else {
        echo json_encode(['ok'=>false, 'error'=>'captchaIncorrect']);
    }
    exit;
}

// fallback
http_response_code(404);
echo "Not found";
