xquery version "3.1";

(:~
 : Extension functions for SSRQ.
 :)
module namespace pmf="http://www.tei-c.org/tei-simple/xquery/functions/koenigsfelden-web";

declare namespace tei="http://www.tei-c.org/ns/1.0";

import module namespace html="http://www.tei-c.org/tei-simple/xquery/functions";
import module namespace pmc="http://www.tei-c.org/tei-simple/xquery/functions/koenigsfelden-common" at "ext-common.xql";
import module namespace config="http://www.tei-c.org/tei-simple/config" at "config.xqm";


(: Register :)

declare function pmf:list-places($doc as element()) {
    let $ids := $doc//tei:placeName/@ref
    where exists($ids)
    return
        (<h3 class="place">Orte</h3>,
        <ul>{
            for $id in  distinct-values($ids)
            let $place := collection($config:registers)/id($id)[1]
            let $region := if ($place/descendant::tei:region) then ' (' || string-join($place/descendant::tei:region, ', ') ||  ')' else 
                if ($place/descendant::tei:country) then ' (' || $place/descendant::tei:country || ')'
                else ()
            return
                <li data-ref="{$id}">
                   <paper-checkbox class="select-facet" title="i18n(highlight-facet)"/> <a
                        href="../../detail.html?ref={$id}">
                        {$place/tei:placeName/string()}
                    </a>
                    <span class="info">{$region}</span>
                </li>
    }</ul>)
};

declare function pmf:list-keys($doc as element()) {
    let $keywords := $doc//tei:keywords/tei:term/string()
    where exists($keywords)
    return  
        (<h3>Schlagwörter</h3>,
        <ul>{
            for $keyword in $keywords
            let $id := doc($config:registers || '/keywords.xml')//tei:catDesc[. = $keyword]/parent::*/@xml:id
            return
                <li data-ref="{$id}">
                    <a
                        href="../../detail.html?ref={$id}">
                        {$keyword}</a></li>
    }</ul>)
};


declare function pmf:list-people($doc as element()) {
 let $ids := $doc//tei:text//tei:persName/@ref |
        $doc//@scribe[starts-with(., 'per')]
    where exists($ids)
    return
        (<h3 class="person">Personen</h3>,
        <ul>{
            for $id in distinct-values($ids)
            let $person :=  collection($config:registers)/id($id)[1]
            return
                <li data-ref="{$id}">
                     <paper-checkbox class="select-facet" title="i18n(highlight-facet)"/> <a
                        href="../../detail.html?ref={$id}">
                        {$person/tei:persName[@type eq 'main']/string()}
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

declare function pmf:list-organizations($doc as element()) {
    let $ids := $doc//tei:text//tei:orgName/@ref
    where exists($ids)
    return 
        (<h3 class="organization">Familien/Organisationen</h3>,
        <ul>{
            for $id in distinct-values($ids)
            let $organization :=  collection($config:registers)/id($id)[1]
            return
                 <li data-ref="{$id}"> <paper-checkbox class="select-facet" title="i18n(highlight-facet)"/>
                    <a
                        href="../../detail.html?ref={$id}">
                        {$organization/tei:orgName[1]/string()}
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

declare function pmf:register-data($config as map(*), $node as element(), $content) {
    <div class="register">{
    (pmf:list-people($node), pmf:list-organizations($node), pmf:list-places($node), pmf:list-keys($node))
    }</div>
};

declare function pmf:get-links($ref as xs:string, $type as xs:string) {
    let $ids := tokenize($ref, '\s+')
    for $id in $ids 
    let $entity := collection($config:registers)/id($id)[1]
    let $personOrgs := if ($type eq 'person') then doc($config:registers || '/people.xml')//tei:person[descendant::tei:affiliation[some $x in tokenize(@ref, '\s+') satisfies $x = $id]] else ()
    let $type := if ($personOrgs) then 'people' else $type 
    let $members := for $person in $personOrgs order by $person/tei:persName[@type eq 'main'] return <li><a href="detail.html?ref={$person/@xml:id}">{$person/tei:persName[@type eq 'main']}</a></li>
    return
        switch($type)
            case 'org' return <li><a href="detail.html?ref={$entity/@xml:id}">{$entity/tei:orgName[1]}</a></li>
            case 'people' return (<h4>Mitglieder</h4>, <ul>{$members}</ul>)
            default return ()
};


declare function pmf:semantic-ref($config as map(*), $node as element(), $class as xs:string+, $content,
    $ref, $label) {
    let $url := "api/entity/" || $ref
    return
        <pb-popover data-ref="{$ref}" class="{$class}" remote="{$url}" trigger="mouseenter focus"><a href="../../detail.html?ref={$ref}">{html:apply-children($config, $node, $content)}</a> <span slot="alternate"></span></pb-popover> 
};

declare function pmf:link($config as map(*), $node as element(), $class as xs:string+, $content, $link, $target) {
    <a href="{$link}" class="{$class}">
    {
        if ($target) then
            attribute target { $target }
        else
            (),
        html:apply-children($config, $node, $content)
    }</a>
};


declare function pmf:term-reference($config as map(*), $node as element(), $class as xs:string+, $content,
    $ref, $label) {
    let $lang := 'de'
    let $url :=
        typeswitch($node)
            case element(tei:persName) | element(tei:orgName) return
                "https://koenigsfelden.sources-online.org/detail.html?ref=" || $ref[1]
            case element(tei:placeName)  | element(tei:origPlace)  return
                "https://koenigsfelden.sources-online.org/detail.html?ref=" || $ref
            default return $ref
    return
        <span class="reference {$class}">
            <span><span data-url="{$url}">{$config?apply-children($config, $node, $content)},</span></span>
            <span class="altcontent">
                {$label, if (empty($ref)) then () else <span class="ref" data-ref="{$ref}"/>}
            </span>
        </span>
};

declare function pmf:dorsualparagraph($config as map(*), $node as element(), $class as xs:string+, $content,
    $ref, $label) {
    let $lang := 'de'
    return
        <p class="alternate {$class}">
            <span>{$config?apply-children($config, $node, $content)}</span>
            <span class="altcontent">
                {"Dorsualschicht: " || $label, if (empty($ref)) then () else ()}
            </span>
        </p>
};

declare function pmf:marginalparagraph($config as map(*), $node as element(), $class as xs:string+, $content,
    $ref, $label) {
    let $lang := 'de'
    return
        <p class="alternate {$class}">
            <span>{$config?apply-children($config, $node, $content)}</span>
            <span class="altcontent">
                {$label, if (empty($ref)) then () else ()}
            </span>
        </p>
};

declare function pmf:alternote($config as map(*), $node as element(), $class as xs:string+, $content,
    $label, $type, $alternate, $optional as map(*)) {
    let $nodeId :=
        if ($node/@exist:id) then
            $node/@exist:id
        else
            util:node-id($node)
    let $id := translate($nodeId, "-", "_")
    let $nr := pmc:increment-counter($type)
    let $alternate := $config?apply-children($config, $node, $alternate)
    let $prefix := $config?apply-children($config, $node, $optional?prefix)
    let $label :=
        switch($type)
            case "text-critical" return
                pmc:footnote-label($nr)
            default return
                $nr
    let $enclose := $type = "text-critical" and matches($content, "\w+\s+\w+")
    let $labelStart := string-join(($label, if ($enclose) then "–" else ()))
    let $labelEnd := string-join((if ($enclose) then "–" else (), $label))
    return (
        if ($enclose) then
            <span class="note-wrap">
                <a class="note note-start" rel="footnote" href="#fn:{$id}">
                { $labelStart }
                </a>
            </span>
        else
            (),
        <pb-popover class="{$class}">
            <span slot="default">{html:apply-children($config, $node, $content)}</span>
            <template slot="alternate">{$prefix}{$alternate}</template>
        </pb-popover>,
        <span id="fnref:{$id}" class="note-wrap">
            <a class="note note-end" rel="footnote" href="#fn:{$id}">
            { $labelEnd }
            </a>
        </span>,
        <li class="footnote" id="fn:{$id}" value="{$nr}"
            type="{if ($type = 'text-critical') then 'a' else '1'}">
            <span class="fn-content">
                {$prefix}{$alternate}
            </span>
            <a class="fn-back" href="#fnref:{$id}">↩</a>
        </li>
    )
};

declare function pmf:note($config as map(*), $node as element(), $class as xs:string+, $content, $place, $label, $type, $optional as map(*)) {
    switch ($place)
        case "margin" return
            if ($label) then (
                <span class="margin-note-ref">{$label}</span>,
                <span class="margin-note">
                    <span class="n">{$label/string()}) </span>{ $config?apply-children($config, $node, $content) }
                </span>
            ) else
                <span class="margin-note">
                { $config?apply-children($config, $node, $content) }
                </span>
        default return
            let $nodeId :=
                if ($node/@exist:id) then
                    $node/@exist:id
                else
                    util:node-id($node)
            let $id := translate($nodeId, "-", "_")
            let $nr := pmc:increment-counter($type)
            let $content := $config?apply-children($config, $node, $content)
            let $prefix := $config?apply-children($config, $node, $optional?prefix)
            let $n :=
                switch($type)
                    case "text-critical" case "text-critical-start" return
                        pmc:footnote-label($nr)
                    default return
                        $nr
            return (
                <span id="fnref:{$id}" class="note-wrap">
                    <a class="note" rel="footnote" href="#fn:{$id}" data-label="{$n}">
                    { if ($type = "text-critical-start") then $n || "–" else $n }
                    </a>
                </span>,
                <li class="footnote" id="fn:{$id}" value="{$nr}"
                    type="{if ($type = ('text-critical','text-critical-start')) then 'a' else '1'}">
                    <span class="fn-content">
                        {$prefix}{$content}
                    </span>
                    <a class="fn-back" href="#fnref:{$id}">↩</a>
                </li>
            )
};

declare function pmf:notespan-end($config as map(*), $node as element(), $class as xs:string+, $content) {
    let $nodeId :=
        if ($content/@exist:id) then
            $content/@exist:id
        else
            util:node-id($content)
    let $id := translate($nodeId, "-", "_")
    return
        <tei-endnote class="note" rel="footnote" href="#fn:{$id}"/>
};

declare function pmf:finish($config as map(*), $input as node()*) {
    for $node in $input
    return
        typeswitch ($node)
            case element(tei-endnote) return
                let $start := root($node)//a[@href = $node/@href]
                return
                    <span class="note-wrap">
                        <a>
                        {
                            $node/@*,
                            "–" || $start/@data-label
                        }
                        </a>
                    </span>
            case element() return
                element { node-name($node) } {
                    $node/@*,
                    pmf:finish($config, $node/node())
                }
            default return
                $node
};

declare function pmf:copy($config as map(*), $node as element(), $class as xs:string+, $content) {
    $content ! $config?apply($config, pmf:copy(.))
};

declare %private function pmf:copy($nodes as node()*) {
    for $node in $nodes
    return
        typeswitch($node)
            case element() return
                element { node-name($node) } {
                    $node/@*,
                    pmf:copy($node/node())
                }
            default return $node
};

declare function pmf:caption($config as map(*), $node as element(), $class as xs:string+, $content) {
    <caption class="{$class}">{html:apply-children($config, $node, $content)}</caption>
};


declare function pmf:content($config as map(*), $node as node(), $class as xs:string+, $content as item()*) {
    typeswitch($content)
        case attribute() return
            text { $content }
        case text() return
            $content
        default return
            text { $content }
};
