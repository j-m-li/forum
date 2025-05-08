<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'utils.php';
$user = get_authenticated_user();
if (!$user || empty($user['is_admin'])) {
    http_response_code(403);
    echo json_encode(["ok"=>false,"error"=>"adminOnly"]);
    exit;
}
$usersDir = "$dataDir/users";
$list = [];
foreach (glob("$usersDir/*.json") as $file) {
    $ud = json_decode(file_get_contents($file), true);
    $list[] = [
        "username"=>$ud["username"],
        "is_admin"=>!empty($ud["is_admin"])
    ];
}
echo json_encode(["ok"=>true,"users"=>$list]);
