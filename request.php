<?php
    include_once 'database.php';

    $query = "SELECT * FROM photos";
    mysqli_set_charset($link,"utf8");
    $result = mysqli_query($link, $query);

    $return_arr = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $id = $row['id'];
        $title = $row['title'];
        $longitude = $row['longitude'];
        $latitude = $row['latitude'];
        $url = $row['url'];
        $return_arr[] = array('id' => $id,'title' => $title, 'longitude' => $longitude, 'latitude' => $latitude, 'url' => $url);
    }
    header('Content-Type: application/json');
    echo json_encode($return_arr);
    exit;
?>
