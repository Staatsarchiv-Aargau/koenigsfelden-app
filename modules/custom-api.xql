xquery version "3.1";

(:~
 : This is the place to import your own XQuery modules for either:
 :
 : 1. custom API request handling functions
 : 2. custom templating functions to be called from one of the HTML templates
 :)
module namespace api="http://teipublisher.com/api/custom";

(: Add your own module imports here :)
import module namespace rutil="http://e-editiones.org/roaster/util";
import module namespace app="teipublisher.com/app" at "app.xql";
import module namespace config="http://www.tei-c.org/tei-simple/config" at "config.xqm";

declare namespace tei="http://www.tei-c.org/ns/1.0";


(:~
 : Keep this. This function does the actual lookup in the imported modules.
 :)
declare function api:lookup($name as xs:string, $arity as xs:integer) {
    try {
        function-lookup(xs:QName($name), $arity)
    } catch * {
        ()
    }
};

declare function api:get-ids($request as map(*)) {
    let $type := xmldb:decode-uri($request?parameters?type)
    let $collection := collection($config:data-default)
    let $refs := 
    switch ($type)
        case 'person' return 
           $collection/descendant::tei:text/descendant::tei:persName/@ref | $collection/descendant::*/@scribe
        case 'place' return  $collection/descendant::tei:text/descendant::tei:placeName/@ref
        default return ()
        
    return string-join(distinct-values($refs), '&#10;') };
