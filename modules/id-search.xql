xquery version "3.1";

declare namespace tei="http://www.tei-c.org/ns/1.0";

declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
(:
declare option output:method "json";
declare option output:media-type "application/json";
:)

import module namespace config="http://www.tei-c.org/tei-simple/config" at "config.xqm";

let $id := 
    switch (substring(request:get-parameter('id', 'lem000053'), 1, 3))
        case 'lem'
        case 'key'
            return substring(request:get-parameter('id', 'lem000053'), 1, 9)    (: ignore variants :)
        case 'loc'
            return substring(request:get-parameter('id', 'lem000053'), 1, 9)    (: ignore variants :)
        case 'per'
            return substring(request:get-parameter('id', 'lem000053'), 1, 9)    (: ignore variants :)
        case 'org'
            return substring(request:get-parameter('id', 'lem000053'), 1, 9)    (: ignore variants :)
        case 'dor'
            return substring(request:get-parameter('id', 'lem000053'), 1, 10)    (: ignore variants :)
        default
            return ()

let $search-results :=
    switch (substring($id, 1, 3))
        case 'lem'
        case 'key'
            return collection($config:data-root)/tei:TEI[descendant::tei:term/substring(data(@ref), 1, 9)=$id]
        case 'loc'
            return collection($config:data-root)/tei:TEI[descendant::tei:placeName/substring(data(@ref), 1, 9)=$id]
        case 'per'
            return collection($config:data-root)/tei:TEI[descendant::tei:persName/substring(data(@ref), 1, 9)=$id]
        case 'org'
            return collection($config:data-root)/tei:TEI[descendant::tei:orgName/substring(data(@ref), 1, 9)=$id]
        case 'dor'
            return collection($config:data-root)/tei:TEI[descendant::tei:p/substring(data(@rend), 1, 10)=$id]
        default
            return ()

return (
    <results>
        {for $result in $search-results
            let $idno := util:document-name($result)
            let $key  := $result/tei:teiHeader/tei:fileDesc/tei:sourceDesc//tei:altIdentifier/tei:idno[@type="short"]/text()
            let $date := $result/tei:teiHeader/tei:fileDesc/tei:sourceDesc/tei:listWit/tei:witness/tei:msDesc/tei:history/tei:origin/tei:origDate/text()
            order by $idno
            return
                <result>
                    <idno>{$idno}</idno>
                    <citationKey>{$key}</citationKey>
                    <date>{$date}</date>
                </result>
        }
    </results>
)


(: TH: 23.03.2021  Alte Version Zeile 35: let $idno := $result/tei:teiHeader/tei:fileDesc/tei:seriesStmt/tei:idno/text() :)