<?php
    include_once 'database.php';

    $query = "SELECT * FROM photos";
    mysqli_set_charset($link,"utf8");
    $result = mysqli_query($link, $query);

    $return_arr = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $id = $row['id'];
        $photo_id = $row['photo_id'];
        $server = $row['server'];
        $farm = $row['farm'];
        $secret = $row['secret'];

        $title = $row['title'];
        $longitude = $row['longitude'];
        $latitude = $row['latitude'];
        $url = 'http://farm' . $farm . '.staticflickr.com/' . $server . '/' . $photo_id . '_' . $secret . '.jpg';

        $return_arr[] = array('id' => $id,'title' => $title, 'longitude' => $longitude, 'latitude' => $latitude, 'url' => $url);
    }
    header('Content-Type: application/json');
    echo json_encode($return_arr);
    exit;
?>
