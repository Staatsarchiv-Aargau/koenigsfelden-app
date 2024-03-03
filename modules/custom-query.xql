xquery version "3.1";
import module namespace app="teipublisher.com/app" at "app.xql";
declare variable $id := request:get-parameter('id', 'dorsual_01');
app:get-dorsual-collection($id)
