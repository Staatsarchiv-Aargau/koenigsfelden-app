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
    let $type := if (starts-with($ref, 'per')) then 'person' else if (starts-with($ref, 'loc')) then 'place' else if(starts-with($ref, 'key')) then 'keyword' else 'org'
    return
        map:merge(($model, map {"key" : $ref, "type": $type}))
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
    let $key := $model?key
    let $type := $model?type
    (: Until @ref attribute is added to the keywords within the documents, mentions are based on full form  :)
    let $id := if ($type eq 'keyword') then doc($config:registers || '/keywords.xml')/id($key)/tei:catDesc else $key
    let $docsCollection := 
    switch ($type) 
        case 'person' return
            collection($config:data-default)//tei:text[ft:query(., 'person-mentioned:' || $id, map { 'fields' : ('person-mentioned' , 'date')})]
        case 'place' return  
            collection($config:data-default)//tei:text[ft:query(., 'place-mentioned:' || $id, map { 'fields' : ('place-mentioned' , 'date')})]
        case 'org' return  
            collection($config:data-default)//tei:text[ft:query(., 'org-mentioned:' || $id, map { 'fields' : ('org-mentioned' , 'date')})]
        default return 
            collection($config:data-default)//tei:text[ft:query(., 'keyword-mentioned:' || $id, map { 'fields' : ('keyword-mentioned' , 'date')})]
   let $docs := for $text in $docsCollection
        let $d := ft:field($text, 'date')
        let $root := $text/ancestor::tei:TEI
        let $keywords := $root/tei:teiHeader/descendant::tei:term
        let $hits := $text//*[@ref = $model?key]
        let $mentions := for $mention in $hits return string-join(app:dispatch($mention), '')
        order by $d ascending
        return 
            <tr>
                <td><a href="data/docs/{ft:field($text, 'file')}">{$root/descendant::tei:titleStmt/tei:title/text()}</a></td>
                <td>{(string-join(distinct-values($mentions), '; '), <span style="color:#837A82">{' (' || count($hits) || ' Treffer)'}</span>)}</td>
                <td>{string-join($keywords, '; ')}</td>
                <td>{$root/descendant::tei:summary/string()}</td>
            </tr>
    return 
        if ($docs and ($model?type ne 'keyword')) then
        <div class="panel">
            <h3 class="panel-title">Vorkommen in Dokumenten</h3>
            <table>
                <tr><th>Dokument</th><th>Erwähnung</th><th>Schlagwörter</th></tr>
                {for $doc in $docs 
                return 
                    <tr>
                        {$doc/subsequence(td, 1, 3)}
                    </tr>
                    
            }</table>
        </div>
        else 
            if ($docs) then 
                <div class="panel">
            <h3 class="panel-title">Vorkommen in Dokumenten</h3>
            <table>
                <tr><th>Dokument</th><th>Schlagwörter</th><th>Regest</th></tr>
                 {for $doc in $docs 
                return 
                    <tr>
                        {$doc/td[1], $doc/subsequence(td, 3)}
                    </tr>
                    
            }
            </table>
        </div>
            else ()
    }; 

declare function app:current-date($node as node(), $model as map(*)) {
    let $date := current-date()
    return format-date($date, '[D1].[M1].[Y0001]')
};

declare function app:get-url($node as node(), $model as map(*)) {
    let $host := 'https://www.koenigsfelden.uzh.ch/'
    let $doc := $model?doc
    let $url := $host || $doc
    return ('&lt;', <a href="{$url}">{$url}</a>, '&gt;')
};

declare
    %templates:wrap
function app:get-dorsual-collection($id as xs:string) {
    let $results := collection($config:data-root)/tei:TEI[descendant::tei:p/substring(data(@rend), 1, 10)=$id]
    return
        <ul xmlns="http://www.w3.org/1999/xhtml"> {
    for $result in $results
            let $idno := util:document-name($result)
            let $key  := $result/tei:teiHeader/tei:fileDesc/tei:sourceDesc//tei:altIdentifier/tei:idno[@type="short"]/text()
            let $date := $result/tei:teiHeader/descendant::tei:origDate/text()
            order by $idno
            return
                <li><a href="../data/docs/{$idno}">{$key}</a>. {$date}</li>
        }</ul>
    };

declare function app:dispatch($node as node()) as item() * {
    typeswitch($node)
        case text() return $node
        case element(tei:choice) return app:choice($node)
        case element(tei:reg) return app:reg($node)
        default return app:passthru($node)
};

declare function app:passthru($node as node()) as item()* {
    for $child in $node/node() return app:dispatch($child)
};

declare function app:choice($node as element(tei:choice)) as item()+ {
app:passthru($node/tei:corr|$node/tei:reg|$node/tei:expan)};

declare function app:reg($node as element(tei:reg)) as item()* {
    if ($node/@type) then () else $node/node()};


