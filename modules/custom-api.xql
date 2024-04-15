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
import module namespace ext-common="http://www.tei-c.org/tei-simple/xquery/functions/koenigsfelden-common" at "ext-common.xql";

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
        
    return string-join(distinct-values($refs), '&#10;')
    };

declare function api:places-all($request as map(*)) {
    let $places := doc($config:registers || '/places.xml')//tei:place[descendant::tei:geo]
    return 
        array { 
            for $place in $places
                let $tokenized := tokenize($place/tei:location/tei:geo)
                let $label := if ($place/tei:placeName[@xml:lang eq 'deu']) then $place/tei:placeName[@xml:lang eq 'deu'] else $place/tei:placeName[1] 
                let $id := $place/@xml:id/string()
                return 
                    map {
                        "latitude":$tokenized[1],
                        "longitude":$tokenized[2],
                        "label":$label/string(),
                        "id":$id
                    }
            }        
};

declare function api:format-name($name as node()) {
    let $tokens := tokenize($name, '\s+')
    let $surname := $tokens[last()]
    let $forename := $tokens[position() < last()]
    return
        $surname || ', ' || string-join($forename, ' ')
    };

declare function api:person-list($request as map(*)){
    let $search := normalize-space($request?parameters?search)
    let $letterParam := $request?parameters?category
    let $sortDir := $request?parameters?dir
    let $limit := $request?parameters?limit
    let $doc := doc($config:registers || '/people.xml')
    let $people :=
            if ($search and $search != '') then
(:                $doc//tei:person[@xml:id][ft:query(., 'name:(' || $search || '*)')]
 : for some reason that field is not indexing properly :)
                 $doc//tei:person[matches(tei:persName[@type eq 'main'], $search, 'i')]
            else
                $doc//tei:person
    let $byKey := for-each($people, function($person as element()) {
        let $name := $person//tei:persName[@type eq 'main']
        let $surname := tokenize($name, '\s+')[last()]
        let $label := if ($surname eq 'NN') then $name/string() else api:format-name($name)
        let $sortKey :=
            if ($surname eq 'NN') then $name
            else
                $surname
        return
            [lower-case($sortKey), $label, $person]
    })
    let $sorted := api:sort($byKey, $sortDir)
    let $letter := 
        if (count($people) < $limit) then 
            "Alle"
        else if ($letterParam = '') then
            substring($sorted[1]?1, 1, 1) => upper-case()
        else
            $letterParam
    let $byLetter :=
        if ($letter = 'Alle') then
            $sorted
        else
            filter($sorted, function($entry) {
                starts-with($entry?1, lower-case($letter))
            })
    return
        map {
            "items": api:output-register-all($byLetter, 'person'),
            "categories":
                if (count($people) < $limit) then
                    []
                else array {
                    for $index in 1 to string-length('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
                    let $alpha := substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $index, 1)
                    let $hits := count(filter($sorted, function($entry) { starts-with($entry?1, lower-case($alpha))}))
                    where $hits > 0
                    return
                        map {
                            "category": $alpha,
                            "count": $hits
                        },
                    map {
                        "category": "Alle",
                        "count": count($sorted)
                    }
                }
        }
};

declare function api:organization-list($request as map(*)){
    let $search := normalize-space($request?parameters?search)
    let $letterParam := $request?parameters?category
    let $sortDir := $request?parameters?dir
    let $limit := $request?parameters?limit
    let $doc := doc($config:registers || '/organizations.xml')
    let $orgs :=
            if ($search and $search != '') then 
 (: for some reason that field is not indexing properly :)
                 $doc//tei:org[matches(tei:orgName[1], $search, 'i')]
            else
                $doc//tei:org
    let $byKey := for-each($orgs, function($org as element()) {
        let $name := $org//tei:orgName[1]
        let $label := $name/string()
        let $sortKey :=
            if (starts-with($label, "von ")) then
                substring($label, 5) else if (starts-with($label, "[von] ")) then
                substring($label, 7) 
            else
                $label
        return
            [lower-case($sortKey), $label, $org]
    })
    let $sorted := api:sort($byKey, $sortDir)
    let $letter := 
        if (count($orgs) < $limit) then 
            "Alle"
        else if ($letterParam = '') then
            substring($sorted[1]?1, 1, 1) => upper-case()
        else
            $letterParam
    let $byLetter :=
        if ($letter = 'Alle') then
            $sorted
        else
            filter($sorted, function($entry) {
                starts-with($entry?1, lower-case($letter))
            })
    return
        map {
            "items": api:output-register-all($byLetter, 'org'),
            "categories":
                if (count($orgs) < $limit) then
                    []
                else array {
                    for $index in 1 to string-length('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
                    let $alpha := substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $index, 1)
                    let $hits := count(filter($sorted, function($entry) { starts-with($entry?1, lower-case($alpha))}))
                    where $hits > 0
                    return
                        map {
                            "category": $alpha,
                            "count": $hits
                        },
                    map {
                        "category": "Alle",
                        "count": count($sorted)
                    }
                }
        }
};

declare function api:list-all-keywords() {
    let $collection := collection($config:data-default)
    return distinct-values($collection/descendant::tei:term[string-length(.) gt 0])
    };

declare function api:keyword-list($request as map(*)){
    let $search := normalize-space($request?parameters?search)
    let $letterParam := $request?parameters?category
    let $sortDir := $request?parameters?dir
    let $limit := $request?parameters?limit
(:  :    let $all-keywords := api:list-all-keywords() :)
    let $all-keywords := doc($config:registers || '/keywords.xml')//tei:category
    let $keywords :=
            if ($search and $search != '') then 
                 $all-keywords[matches(tei:catDesc, $search, 'i')]
            else
                $all-keywords
    let $byKey := for-each($keywords, function($keyword as element()) {
        let $name := $keyword/tei:catDesc/string()
        let $label := $keyword/tei:catDesc/string()
        let $sortKey := $label
        return
            [lower-case($sortKey), $label, $keyword]
    })
    let $sorted := api:sort($byKey, $sortDir)
    let $letter := 
        if (count($keywords) < $limit) then 
            "Alle"
        else if ($letterParam = '') then
            substring($sorted[1]?1, 1, 1) => upper-case()
        else
            $letterParam
    let $byLetter :=
        if ($letter = 'Alle') then
            $sorted
        else
            filter($sorted, function($entry) {
                starts-with($entry?1, lower-case($letter))
            })
    return
        map {
            "items": api:output-register-all($byLetter, 'keyword'),
            "categories":
                if (count($keywords) < $limit) then
                    []
                else array {
                    for $index in 1 to string-length('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
                    let $alpha := substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $index, 1)
                    let $hits := count(filter($sorted, function($entry) { starts-with($entry?1, lower-case($alpha))}))
                    where $hits > 0
                    return
                        map {
                            "category": $alpha,
                            "count": $hits
                        },
                    map {
                        "category": "Alle",
                        "count": count($sorted)
                    }
                }
        }
};

declare function api:place-list($request as map(*)){
    let $search := normalize-space($request?parameters?search)
    let $letterParam := $request?parameters?category
    let $sortDir := $request?parameters?dir
    let $limit := $request?parameters?limit
    let $doc := doc($config:registers || '/places.xml')
    let $places :=
            if ($search and $search != '') then
(:                $doc//tei:place[ft:query(., 'name:(' || $search || '*)')]
 : for some reason that field is not indexing properly:)
                    
                  $doc//tei:place[matches(tei:placeName, $search, 'i')]
            else
                $doc//tei:place
    let $byKey := for-each($places, function($place as element()) {
        let $name := if ($place/tei:placeName[@xml:lang eq 'deu']) then $place/tei:placeName[@xml:lang eq 'deu'] else $place/tei:placeName[1] 
        let $label := string($name)
        let $sortKey := $label
        return
            [lower-case($sortKey), $label, $place]
    })
    let $sorted := api:sort($byKey, $sortDir)
    let $letter := 
        if (count($places) < $limit) then 
            "Alle"
        else if ($letterParam = '') then
            substring($sorted[1]?1, 1, 1) => upper-case()
        else
            $letterParam
    let $byLetter :=
        if ($letter = 'Alle') then
            $sorted
        else
            filter($sorted, function($entry) {
                starts-with($entry?1, lower-case($letter))
            })
    return
        map {
            "items": api:output-register-all($byLetter, 'place'),
            "categories":
                if (count($places) < $limit) then
                    []
                else array {
                    for $index in 1 to string-length('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
                    let $alpha := substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $index, 1)
                    let $hits := count(filter($sorted, function($entry) { starts-with($entry?1, lower-case($alpha))}))
                    where $hits > 0
                    return
                        map {
                            "category": $alpha,
                            "count": $hits
                        },
                    map {
                        "category": "Alle",
                        "count": count($sorted)
                    }
                }
        }
};

declare function api:output-register-all($list, $type as xs:string) {
    array {
        for $item in $list
        let $log := util:log("info", $item)
        return
            switch ($type)
                case 'place' return
                    let $label := $item?2
                    let $coords := tokenize($item?3//tei:geo)
                    return
                    <span class="register-item"><a href="detail.html?ref={$item?3/@xml:id}">{$label} ({$item?3//tei:country/string()})</a> 
                    {if (count($coords) eq 2) then 
                          <pb-geolocation latitude="{$coords[1]}" longitude="{$coords[2]}" label="{$label}" emit="map" event="click">
                                <iron-icon icon="maps:map"></iron-icon>
                            </pb-geolocation>  else ()
                    }
                    </span>
                default return
                    <span class="register-item"><a href="detail.html?ref={$item?3/@xml:id}">{$item?2}</a></span>
    }
};

declare function api:sort($list as array(*)*, $dir as xs:string) {
    let $sorted :=
        sort($list, "?lang=de-DE", function($entry) {
            $entry?1
        })
    return
        if ($dir = "asc") then
            $sorted
        else
            reverse($sorted)
};

declare function api:timeline($request as map(*)) {
    let $entries := session:get-attribute($config:session-prefix || '.hits')
    let $datedEntries := filter($entries, function($entry) {
            try {
                let $date := ft:field($entry, "date-min", "xs:date")
                return
                        exists($date) and year-from-date($date) != 1000
            } catch * {
                false()
            }
        })
    return
        map:merge(
            for $entry in $datedEntries
            group by $date := ft:field($entry, "date-min", "xs:date")
            return
                map:entry(format-date($date, "[Y0001]-[M01]-[D01]"), map {
                    "count": count($entry),
                    "info": ''
                })
        )
};

declare function api:get-entity($request as map(*)) {
    let $id := $request?parameters?id
    let $entity := collection($config:registers)/id($id)
    let $dates := if ($entity/descendant::tei:death) then ' (' || string-join(($entity/tei:birth, $entity/tei:death), '–') || ')' else ()
    let $country := if ($entity/descendant::tei:country) then ' (' || string-join($entity/descendant::tei:country, '–') || ')' else () 
    let $name := 
        typeswitch($entity) 
            case element(tei:person) return 'Person: ' || $entity/tei:persName[1] || $dates
            case element(tei:place) return 'Orte: ' || $entity/tei:placeName[1] || $country
            case element(tei:org) return 'Organisation: ' || $entity/tei:orgName[1]
            default return $id || ' not found'
    return $name
    };