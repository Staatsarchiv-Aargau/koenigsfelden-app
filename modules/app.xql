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
import module namespace http="http://expath.org/ns/http-client" at "java:org.expath.exist.HttpClientModule";


declare namespace tei="http://www.tei-c.org/ns/1.0";

declare variable $app:HOST := "https://www.ssrq-sds-fds.ch";

declare variable $app:PLACES := $app:HOST || "/places-db-edit/views/get-info.xq";
declare variable $app:PERSONS := $app:HOST || "/persons-db-api/";
declare variable $app:LEMMA := $app:HOST || "/lemma-db-edit/views/get-lem-info.xq";
declare variable $app:KEYWORDS := $app:HOST || "/lemma-db-edit/views/get-key-info.xq";



declare
    %templates:wrap
function app:foo($node as node(), $model as map(*)) {
    <p>Dummy templating function.</p>
};

declare  
%templates:wrap
%templates:default("id","")
function app:load-model($node as node(), $model as map(*), $id as xs:string) {
    let $id := xmldb:decode($id)
    let $type := xmldb:decode($type)
    return
        map:merge(($model, map {"key" : $id, "type": $type}))
};


declare function app:api-lookup($api as xs:string, $list as map(*)*, $param as xs:string) {
    for $item in $list
    let $request := <http:request method="GET" href="{$api}?{$param}={$item?ref}"/>
    let $response := http:send-request($request)
    return
        if ($response[1]/@status = "200") then
            let $json := parse-json(util:binary-to-string($response[2]))
            return
                map:merge(($json, map { "ref": $item?ref }))
        else
            ()
};

declare function app:api-keys($refs as xs:string*) {
    for $id in $refs
    group by $ref := substring($id, 1, 9)
    return
        map {
            "ref": $ref,
            "name": $id[1]
        }
};

declare function app:list-places($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $places := $doc//tei:placeName/@ref
    where exists($places)
    return
        (<h2>Orte</h2>,
        <ul>{
            for $place in app:api-lookup($app:PLACES, app:api-keys($places/@ref), "id")
            return
                <li data-ref="{$place?ref}">
                    <a target="_new"
                        href="../../detail.html?ref={$place?ref}">
                        {$place?stdName('#text')}
                    </a>
                    ({$place?location})
                    {$place?type}
                </li>
    }</ul>)
};

declare function app:list-keys($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $keywords := $doc//tei:term[starts-with(@ref, 'key')]
    where exists($keywords)
    return  
        (<h2>Schlagwörter</h2>,
        <ul>{
            for $keyword in app:api-lookup($app:KEYWORDS, app:api-keys($keywords/@ref), "id")
            return
                <li data-ref="{$keyword?ref}">
                    <a href="../../detail.html?ref={$keyword?ref}"
                        target="_new">
                        {$keyword?name("#text")}
                    </a>
                </li>
    }</ul>)
};

declare function app:list-lemmata($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $lemmata := $doc//tei:term[starts-with(@ref, 'lem')]
    where exists($lemmata)
    return
        (<h2>Lemmata</h2>,
        <ul>{
            for $lemma in app:api-lookup($app:LEMMA, app:api-keys($lemmata/@ref), "id")
            return
                <li data-ref="{$lemma?ref}">
                    <a target="_new"
                        href="../../detail.html?ref={$lemma?ref}">
                        {$lemma?stdName("#text")}
                    </a>
                    ({$lemma?morphology})
                    {$lemma?definition("#text")}
                </li>
    }</ul>)
};

declare function app:list-persons($node as node(), $model as map(*)) {
 let $doc := doc($config:data-root || '/' || $model?doc)
 let $persons := $doc//tei:text//tei:persName/@ref |
        $doc//@scribe[starts-with(., 'per')]
    where exists($persons)
    return
        (<h2>Personen</h2>,
        <ul>{
            for $person in app:api-lookup($app:PERSONS, app:api-keys($persons), "id_search")
            return
                <li data-ref="{$person?ref}">
                    <a target="_new"
                        href="../../detail.html?ref={$person?ref}">
                        {$person?name}
                    </a>
                    {
                        if ($person?dates) then
                            <span class="info"> ({$person?dates})</span>
                        else
                            ()
                    }
                </li>
        }</ul>)
};

declare function app:list-organizations($node as node(), $model as map(*)) {
    let $doc := doc($config:data-root || '/' || $model?doc)
    let $organizations := $doc//tei:text//tei:orgName/@ref
    where exists($organizations)
    return 
        (<h2>Organisationen</h2>,
        <ul>{
            for $organization in app:api-lookup($app:PERSONS, app:api-keys($organizations), "id_search")
            return
                <li data-ref="{$organization?ref}">
                    <a target="_new"
                        href="../../detail.html?ref={$organization?ref}">
                        {$organization?name}
                    </a>
                    {
                        if ($organization?type) then
                            <span class="info"> ({$organization?type})</span>
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

