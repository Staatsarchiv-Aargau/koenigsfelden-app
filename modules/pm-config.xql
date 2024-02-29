
xquery version "3.1";

module namespace pm-config="http://www.tei-c.org/tei-simple/pm-config";

import module namespace pm-koenigsfelden-web="http://www.tei-c.org/pm/models/koenigsfelden/web/module" at "../transform/koenigsfelden-web-module.xql";
import module namespace pm-koenigsfelden-print="http://www.tei-c.org/pm/models/koenigsfelden/print/module" at "../transform/koenigsfelden-print-module.xql";
import module namespace pm-koenigsfelden-latex="http://www.tei-c.org/pm/models/koenigsfelden/latex/module" at "../transform/koenigsfelden-latex-module.xql";
import module namespace pm-koenigsfelden-epub="http://www.tei-c.org/pm/models/koenigsfelden/epub/module" at "../transform/koenigsfelden-epub-module.xql";
import module namespace pm-koenigsfelden-fo="http://www.tei-c.org/pm/models/koenigsfelden/fo/module" at "../transform/koenigsfelden-fo-module.xql";
import module namespace pm-koenigsfelden-register-web="http://www.tei-c.org/pm/models/koenigsfelden-register/web/module" at "../transform/koenigsfelden-register-web-module.xql";
import module namespace pm-docx-tei="http://www.tei-c.org/pm/models/docx/tei/module" at "../transform/docx-tei-module.xql";
import module namespace pm-teipublisher-web="http://www.tei-c.org/pm/models/teipublisher/web/module" at "../transform/teipublisher-web-module.xql";
import module namespace pm-teipublisher-print="http://www.tei-c.org/pm/models/teipublisher/print/module" at "../transform/teipublisher-print-module.xql";
import module namespace pm-teipublisher-latex="http://www.tei-c.org/pm/models/teipublisher/latex/module" at "../transform/teipublisher-latex-module.xql";
import module namespace pm-teipublisher-epub="http://www.tei-c.org/pm/models/teipublisher/epub/module" at "../transform/teipublisher-epub-module.xql";
import module namespace pm-teipublisher-fo="http://www.tei-c.org/pm/models/teipublisher/fo/module" at "../transform/teipublisher-fo-module.xql";

declare variable $pm-config:web-transform := function($xml as node()*, $parameters as map(*)?, $odd as xs:string?) {
    switch ($odd)
    case "koenigsfelden.odd" return pm-koenigsfelden-web:transform($xml, $parameters)
case "koenigsfelden-register.odd" return pm-koenigsfelden-register-web:transform($xml, $parameters)
case "teipublisher.odd" return pm-teipublisher-web:transform($xml, $parameters)
    default return pm-koenigsfelden-web:transform($xml, $parameters)
            
    
};
            


declare variable $pm-config:print-transform := function($xml as node()*, $parameters as map(*)?, $odd as xs:string?) {
    switch ($odd)
    case "koenigsfelden.odd" return pm-koenigsfelden-print:transform($xml, $parameters) 
case "teipublisher.odd" return pm-teipublisher-print:transform($xml, $parameters)
    default return pm-koenigsfelden-print:transform($xml, $parameters)
            
    
};
            


declare variable $pm-config:latex-transform := function($xml as node()*, $parameters as map(*)?, $odd as xs:string?) {
    switch ($odd)
    case "koenigsfelden.odd" return pm-koenigsfelden-latex:transform($xml, $parameters) 
case "teipublisher.odd" return pm-teipublisher-latex:transform($xml, $parameters)
    default return pm-koenigsfelden-latex:transform($xml, $parameters)
            
    
};
            


declare variable $pm-config:epub-transform := function($xml as node()*, $parameters as map(*)?, $odd as xs:string?) {
    switch ($odd)
    case "koenigsfelden.odd" return pm-koenigsfelden-epub:transform($xml, $parameters) 
case "teipublisher.odd" return pm-teipublisher-epub:transform($xml, $parameters)
    default return pm-koenigsfelden-epub:transform($xml, $parameters)
            
    
};
            


declare variable $pm-config:fo-transform := function($xml as node()*, $parameters as map(*)?, $odd as xs:string?) {
    switch ($odd)
    case "koenigsfelden.odd" return pm-koenigsfelden-fo:transform($xml, $parameters) 
case "teipublisher.odd" return pm-teipublisher-fo:transform($xml, $parameters)
    default return pm-koenigsfelden-fo:transform($xml, $parameters)
            
    
};
            


declare variable $pm-config:tei-transform := function($xml as node()*, $parameters as map(*)?, $odd as xs:string?) {
    switch ($odd)
    case "docx.odd" return pm-docx-tei:transform($xml, $parameters)
    default return error(QName("http://www.tei-c.org/tei-simple/pm-config", "error"), "No default ODD found for output mode tei")
            
    
};
            
    