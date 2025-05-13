<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'xmlrpc.php';
$usersDir = "$dataDir/users/";
$captchaDir = "$dataDir/captcha/";
$challengeDir = "$dataDir/slidecaptcha/";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    /*
    $captcha = $data['captcha'] ?? '';
    $captcha_id = $data['captcha_id'] ?? '';
    // Captcha validation
    $captchaFile = "$captchaDir/$captcha_id.txt";
    if (!$captcha_id || !file_exists($captchaFile)) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "captchaMissingOrExpired"]);
        exit;
    }
    $expected = trim(file_get_contents($captchaFile));
    unlink($captchaFile);
    if ((string)$captcha !== (string)$expected) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "captchaIncorrect"]);
        exit;
    }*/

    $headers = getallheaders();
    $id = null;
    foreach ($headers as $name => $value) {
        if (!strcasecmp($name, "x-slide-captcha-id")) {
	    $id = $value;
        }
    }

    if (!$id) {
        echo json_encode(["ok" => false, "error" => "captchaMissingOrExpired"]);
        exit;
    }
    $file = $challengeDir . "challenge_$id.json";
    if (!file_exists($file)) {
        echo json_encode(["ok" => false, "error" => "captchaMissingOrExpired"]);
        exit;
    }
    $challenge = json_decode(file_get_contents($file), true);
    if (empty($challenge['verified']) || !empty($challenge['used'])) {
        echo json_encode(["ok" => false, "error" => "captchaIncorrect"]);
        exit;
    }
    // Mark challenge as used
    $challenge['used'] = true;
    file_put_contents($file, json_encode($challenge));


    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "usernamePasswordRequired"]);
        exit;
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "invalidUsername"]);
        exit;
    }
    if (!is_dir($usersDir)) mkdir($usersDir, 0777, true);
    $userFile = $usersDir . $username . '.json';
    if (file_exists($userFile)) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "usernameTaken"]);
        exit;
    }
    $userData = [
        'username' => $username,
        'password' => password_hash($password, PASSWORD_DEFAULT)
    ];
    file_put_contents($userFile, json_encode($userData, JSON_PRETTY_PRINT));
    unlink($file);
    echo json_encode(["ok" => true]);
    exit;
}
echo json_encode(["ok"=>false,"error"=>"invalidAction"]);
?>
