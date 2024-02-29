xquery version "3.1";

(: 
 : Module for app-specific template functions
 :
 : Add your own templating functions here, e.g. if you want to extend the template used for showing
 : the browsing view.
 :)
module namespace app="teipublisher.com/app";

import module namespace templates="http://exist-db.org/xquery/html-templating";
import module namespace config="http://www.tei-c.org/tei-simple/config" at "config.xqm";
import module namespace pm-config="http://www.tei-c.org/tei-simple/pm-config" at "pm-config.xql";


declare namespace tei="http://www.tei-c.org/ns/1.0";



declare
    %templates:wrap
function app:foo($node as node(), $model as map(*)) {
    <p>Dummy templating function.</p>
};

declare  
%templates:wrap
%templates:default("ref","")
function app:load-model($node as node(), $model as map(*), $ref as xs:string) {
    let $ref := xmldb:decode($ref)
    let $type := if (starts-with($ref, 'per')) then 'person' else if (starts-with($ref, 'loc')) then 'place' else 'org'
    return
        map:merge(($model, map {"key" : $ref, "type": $type}))
};


declare function app:list-places($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $ids := $doc//tei:placeName/@ref
    where exists($ids)
    return
        (<h2>Orte</h2>,
        <ul>{
            for $id in  distinct-values($ids)
            let $place := collection($config:registers)/id($id)[1]
            let $region := if ($place/descendant::tei:region) then ' (' || string-join($place/descendant::tei:region, ', ') ||  ')' else 
                if ($place/descendant::tei:country) then ' (' || $place/descendant::tei:country || ')'
                else ()
            return
                <li data-ref="{$id}">
                    <a target="_new"
                        href="../../detail.html?ref={$id}">
                        {$place/tei:placeName}
                    </a>
                    <span class="info">{$region}</span>
                </li>
    }</ul>)
};

declare function app:list-keys($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $keywords := $doc//tei:keywords/tei:term
    where exists($keywords)
    return  
        (<h2>Schlagwörter</h2>,
        <ul>{
            for $keyword in $keywords
            return
                <li>{$keyword}</li>
    }</ul>)
};


declare function app:list-persons($node as node(), $model as map(*)) {
 let $doc := doc($config:data-root || '/' || $model?doc)
 let $ids := $doc//tei:text//tei:persName/@ref |
        $doc//@scribe[starts-with(., 'per')]
    where exists($ids)
    return
        (<h2>Personen</h2>,
        <ul>{
            for $id in distinct-values($ids)
            let $person :=  collection($config:registers)/id($id)[1]
            return
                <li data-ref="{$id}">
                    <a target="_new"
                        href="../../detail.html?ref={$id}">
                        {$person/tei:persName}
                    </a>
                    {
                        if ($person/tei:death) then
                            <span class="info"> ({string-join(($person/tei:birth, $person/tei:death), '–')})</span>
                        else
                            ()
                    }
                </li>
        }</ul>)
};

declare function app:list-organizations($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $ids := $doc//tei:text//tei:orgName/@ref
    where exists($ids)
    return 
        (<h2>Organisationen</h2>,
        <ul>{
            for $id in distinct-values($ids)
            let $organization :=  collection($config:registers)/id($id)[1]
            return
                <li data-ref="{$id}">
                    <a target="_new"
                        href="../../detail.html?ref={$id}">
                        {$organization/tei:orgName/string()}
                    </a>
                    {
                        if ($organization/tei:desc) then
                            <span class="info"> ({$organization/tei:desc[@xml:lang eq 'de']})</span>
                        else
                            ()
                    }
                </li>
    }</ul>)
};

declare
    %templates:wrap
function app:show-list-items($node as node(), $model as map(*)) {
    for $item in $model?items
    order by $item/a collation "?lang=de_CH"
    return
        $item
};

declare function app:get-entity-info($node as node(), $model as map(*)) {
    let $id := $model?key
    let $entity := collection($config:registers)/id($id)[1]
    let $info :=  $pm-config:web-transform(
                            $entity,
                            map { 
                                "root": $entity, 
                                "view": "single", 
                                "webcomponents": 7},
                                'koenigsfelden-register.odd')
    return
            <div class="panel">
                    {$info}
            </div>
            };

declare function app:get-entity-mentions($node as node(), $model as map(*)) {
    let $id := $model?key
    let $type := $model?type
    let $docsCollection := 
    switch ($type) 
        case 'person' return
            collection($config:data-default)//tei:text[ft:query(., 'person-mentioned:' || $id, map { 'fields' : ('person-mentioned' , 'date')})]
        case 'place' return  
            collection($config:data-default)//tei:text[ft:query(., 'place-mentioned:' || $id, map { 'fields' : ('place-mentioned' , 'date')})]
        case 'org' 
            return  collection($config:data-default)//tei:text[ft:query(., 'org-mentioned:' || $id, map { 'fields' : ('org-mentioned' , 'date')})]
        default return ()
   let $docs :=  for $text in $docsCollection
        let $d := ft:field($text, 'date')
        order by $d ascending
        return
            element a {
                attribute href {'data/docs/' || ft:field($text, 'file') },
                $text/ancestor::tei:TEI//tei:titleStmt/tei:title/text()
                }
    return 
        if ($docs) then
        <div class="panel">
            <h3 class="panel-title">Vorkommen in Dokumenten</h3>
            <ol>{for $doc in $docs 
                return element li { $doc } }
            </ol>
        </div>
        else ()
    }; 
    

