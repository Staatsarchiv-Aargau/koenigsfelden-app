//–––––– HTML CONTROL ELEMENTS INIZIALIZATION ––––––//
var j = 1, dorsuallayers = 33;
var dorsuallayers_names = {
    "1": "Latein pro (< 1321)",
    "2": "ùber, aus Besitz Agnes (< 1343)",
    "3": "Kopieverweis (< 1370)",
    "4": "ùber, nicht aus Besitz Agnes (< 1372)",
    "5": "ùber (< 1381)",
    "6": "Doppelaufstrich (< 1408)",
    "7": "ùber (< 1417)",
    "8": "Auftaktzeichen (< 1418)",
    "9": "Latein Franziskaner (< 1429)",
    "10": "Schräg, regelmässig (< 1466)",
    "11": "ùber (< 1470)",
    "12": "Fricker (< 1478)",
    "13": "Eckig (< 1487)",
    "14": "Rechnungsbuch Hofmeister (< 1497)",
    "15": "Textualis, Orte und Siglen (< 1497)",
    "16": "Kanzleihand Hofmeisterei (< 1511)",
    "17": "Notariatsvermerk Papsturkunden (< 1512)",
    "18": "Zählung Brief (< 1527)",
    "19": "Latein divers (< 1532)53",
    "20": "Regest Bern (< 1534)",
    "21": "Kopialbuchverweis (< 1568)",
    "22": "Sigle Bern (< 1568)",
    "23": "Sammelschicht vor 1600",
    "24": "Nummer",
    "25": "Zahl",
    "26": "Datierung divers",
    "27": "Archivverweis divers",
    "28": "Datierung Urkundenwortlaut",
    "29": "Jahreszahl dreistellig",
    "30": "Jahreszahl vierstellig",
    "31": "StAAG Signatur",
    "32": "StAAG Stempel",
    "33": "StAAG modern",
}
//	filtered groups
typeFilterList = ["1","3","5","6","7","8","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33"];

addCheckboxes(dorsuallayers, document.getElementById("GroupCheckboxDiv" + j.toString()));

//–––––– GRAPH INITIALIZATION ––––––//

// Graph size
var width = $(".svg-wrapper")[0].clientWidth,
    height = 750,
    radius = 5;

//	data stores
var graph, store;

// Variables to toggle groups
var group_id = null;

// In the initialization the group 1 or the first group in the groups array is prioritised
var focus_group_id = 1;
var node_sorting = false;
var label_show = true;
var checked_button = false


// SVG selection and sizing
var svg = d3.select(".svg-wrapper").append("svg")
    .attr("width", width)
    .attr("height", height);

//	d3 color scales
var color = d3.scaleOrdinal(d3.schemeCategory20);

var link = svg.append("g").attr("class", "links").selectAll(".link"),
    node = svg.append("g").attr("class", "nodes").selectAll(".node");


//	force simulation initialization
var simulation = d3.forceSimulation()
    .velocityDecay(0.1)
    .force("x", d3.forceX(width / 2).strength(.05))
    .force("y", d3.forceY(height / 2).strength(.05))
    .force("charge", d3.forceManyBody().strength(-240).distanceMax(400))
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }).distance(50).strength(1))
    .force("center", d3.forceCenter(width / 2, height / 2));


//–––––– TOOLBOX EVENT HANDLING ––––––//

//	checkbox button event handler
$(".form-check-input").on("click", function () {
    group_id = $(this).attr("value");
    if (typeFilterList.includes(group_id)) {
        typeFilterList.splice(typeFilterList.indexOf(group_id), 1)
        focus_group_id = group_id
    } else {
        if (group_id !== "0") {
            typeFilterList.push(group_id);
        }


    }
    // Handles "Hide all groups" case
    if (group_id === "0") {
        if (typeFilterList.length > 1) {
            typeFilterList = []
        } else {
            for (var g = 1; g <= dorsuallayers; g++) {
                typeFilterList.push(g.toString());
            }
        }
    }
    filter();
    update();
});

// Hide all group button handler
$("#uncheckAllLabel").click(function () {
    checked_button = !checked_button
    if(checked_button){
        $('span', this).text('Alle Dorsualschichten ausblenden')}
    else{
        $('span', this).text('Alle Dorsualschichten einblenden')
    }
    selectAll() 
    group_id = 0
   // Handles "Hide all groups" case
    if (typeFilterList.length > 1) {
        typeFilterList = []
    } else {
        for (var g = 1; g <= dorsuallayers; g++) {
            typeFilterList.push(g.toString());
            }
        }
    filter();
    update();
});


// "Show labels" / "hide labels" event handler
$("#label-controls input[name=mode]").on("click", function () {
    var nodes = svg.selectAll(".nodes");
    var circle = nodes.selectAll("g");
    if ($(this).attr("value") === 'show-label') {
        appendLabel(circle)
    } else {
        label_show = false
        svg.selectAll("text").remove();
    }
    if (!node_sorting) {
        filter();
    }
    update();
});
//–––––– GRAPH CREATION ––––––//
//	data read and store
d3.json("resources/scripts/dorsuallayers-data/dorsuallayersGraph.json", function (err, g) {
    if (err) throw err;
    var nodeByID = {};
    g.nodes.forEach(function (n) {
        nodeByID[n.id] = n;
    });
    g.links.forEach(function (l) {
        var index = findGroupIndex(nodeByID[l.source].groups);
        l.sourceGroup = nodeByID[l.source].groups[parseInt(index)].toString();
        l.targetGroup = nodeByID[l.target].groups[0].toString();
    });
    graph = g;
    store = $.extend(true, {}, g);
    filter();
    update();

});    


//	general update pattern for updating the graph
function update() {
    //	UPDATE
    node = node.data(graph.nodes, function (d) {
        return d.id;
    });
    //	EXIT
    node.exit().remove();
    //	ENTER
    var newNode = node.enter().append("g");
    newNode.attr("class", "node")
        .attr("id", function (d) {
            return "ID-" + d.id
        }).append("image")
        .attr("xlink:href", function (d) {
            return "resources/scripts/dorsuallayers-data/"+d.img;
        })
        .attr("x", function (d) {
            if (parseInt(d.id) < 33) {
                return -((radius + 4) * 3) / 2
            } else {
                return -(radius * 3) / 2
            }
        })
        .attr("y", function (d) {
            if (parseInt(d.id) < 33) {
                return -((radius + 4) * 3) / 2
            } else {
                return -(radius * 3) / 2
            }
        })
        .attr("height", function (d) {
            if (parseInt(d.id) < 33) {
                return (radius + 4) * 3
            } else {
                return radius * 3
            }
        }).attr("width", function (d) {
        if (parseInt(d.id) < 33) {
            return (radius + 4) * 3
        } else {
            return radius * 3
        }
    })
        // click on node handler
        .on("click", function () {
            var circle = d3.select(this)._groups[0][0].__data__;
            // if Document node
            if (circle.id > 33 && !node_sorting) {
                node_sorting = true
                filterFromNodes(circle)
            } else {
                filter()
                update()
            }
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    newNode.append("title")
        .text(function (d) {
            group = []
            for (var g in d.groups) {
                group.push(dorsuallayers_names[(parseInt(g) + 1).toString()])
            }

            return "Dorsalschichten: " + group + "\n" + "Name: " + d.name + "\n";
        });
    if (label_show) {
        appendLabel(newNode)
    } else {
        svg.selectAll("text").remove();
    }


    //	ENTER + UPDATE
    node = node.merge(newNode);

    //	UPDATE
    link = link.data(graph.links, function (d) {
        return d.id;
    });
    //	EXIT
    link.exit().remove();
    //	ENTER
    newLink = link.enter().append("line")
        .attr("class", "link");

    newLink.append("title")
        .text(function (d) {
            return "source: " + d.source + "\n" + "target: " + d.target;
        });
    //	ENTER + UPDATE
    link = link.merge(newLink);
    //	update simulation nodes, links, and alpha
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    simulation.alpha(1).alphaTarget(0).restart();

}

//	drag event handlers
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;


}

//	tick event handler with bounded box
function ticked() {
    node
        .attr("transform", function (d) {
            d.x = Math.max(radius*3, Math.min(width-radius*3, d.x));
            d.y = Math.max(radius*3, Math.min(height-radius*3, d.y));
            return "translate(" + d.x + "," + d.y + ")";
        });

    link.attr("x1", function (d) {
        return d.source.x;
    })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });
}

//	filter function
function filter() {
    node_sorting = false
    var nodeByID = {};

    //	add and remove nodes from data based on type filters
    store.nodes.forEach(function (n) {
        nodeByID[n.id] = n;
        if (!typeFilterList.includes(n.groups[parseInt(findGroupIndex(n.groups))]) && n.filtered) {
            n.filtered = false;
            graph.nodes.push($.extend(true, {}, n));
        } else if (typeFilterList.includes(n.groups[parseInt(findGroupIndex(n.groups))]) && !n.filtered) {
            n.filtered = true;
            graph.nodes.forEach(function (d, i) {
                if (n.id === d.id) {
                    graph.nodes.splice(i, 1);
                }
            });
        }

    });

    //	add and remove links from data based on availability of nodes
    store.links.forEach(function (l) {
        var index = findGroupIndex(nodeByID[l.source].groups);
        l.sourceGroup = nodeByID[l.source].groups[parseInt(index)].toString();
        l.targetGroup = nodeByID[l.target].groups[0].toString();
        if (!(typeFilterList.includes(l.sourceGroup) || typeFilterList.includes(l.targetGroup)) && l.filtered) {
            l.filtered = false;
            graph.links.push($.extend(true, {}, l));
        } else if ((typeFilterList.includes(l.sourceGroup) || typeFilterList.includes(l.targetGroup)) && !l.filtered) {
            l.filtered = true;
            graph.links.forEach(function (d, i) {
                if (l.id === d.id) {
                    graph.links.splice(i, 1);
                }
            });
        }
    });
}

// filter per node function
function filterFromNodes(circle) {
    const nodeByID = {};
    // gets the corresponding groups the specific node
    const groups = circle.groups;
    for (let i = 0; i < groups.length; i++) {
        groups[i] = (parseInt(groups[i]) - 1).toString()
    }

    //	add and remove nodes from data if they are not a group node connected to the clicked node
    store.nodes.forEach(function (n) {
        nodeByID[n.id] = n;
        if ((circle.id === n.id || groups.includes((n.id).toString())) && n.filtered) {
            n.filtered = false;
            graph.nodes.push($.extend(true, {}, n));
        } else if ((circle.id !== n.id && !groups.includes((n.id).toString())) && !n.filtered) {
            n.filtered = true;
            graph.nodes.forEach(function (d, i) {
                if (n.id === d.id) {
                    graph.nodes.splice(i, 1);
                }
            });
        }
    });
    //	add and remove links from data based on availability of nodes
    store.links.forEach(function (l) {
        var source = l.source
        if (parseInt(circle.id) === parseInt(source) && l.filtered) {
            l.filtered = false;
            graph.links.push($.extend(true, {}, l));
        } else if (parseInt(circle.id) !== parseInt(source) && !l.filtered) {
            l.filtered = true;
            graph.links.forEach(function (d, i) {
                if (l.id === d.id) {
                    graph.links.splice(i, 1);
                }
            });
        }
    });
    update()

}


//–––––– FUNCTION DEFINITION ––––––//
//sets multiple Attributes
function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

// Adds checkboxes, sets attributes and adds icons
function addCheckboxes(dorsuallayers, div) {
    for (var i = 1; i <= dorsuallayers; i++) {
        var column = document.createElement("div");
        column.setAttribute("class", "col-md-6");
        div.appendChild(column);
        var inlineDiv = document.createElement("div");
        inlineDiv.setAttribute("class", "form-check form-check-inline");
        var text = document.createTextNode(" " + dorsuallayers_names[i] + " ");
        var input = document.createElement("input");
        setAttributes(input, {
            "class": "form-check-input", "name": "group-check", "type": "checkbox",
            "id": "g" + i.toString(),
            "value": i.toString()
        });
        if(!typeFilterList.includes(i.toString())){
            setAttributes(input, {
            "checked": "checked"
        });
        }

        var icon = document.createElement("img")
        setAttributes(icon, {"src": "resources/scripts/dorsuallayers-data/icons/icon-" + (i - 1).toString() + ".png", "width": "15", "style": "margin: 5px"})
        var label = document.createElement("label");
        setAttributes(label, {"class": "form-check-label", "for": "g" + i.toString(), "style": "font-weight: 500;"});
        label.style["font-size"] = "10px";
        label.appendChild(icon)
        label.appendChild(text);
        label.appendChild(input);
        inlineDiv.appendChild(label);
        column.appendChild(inlineDiv);
        if (i % 2 === 0) {
            j++;
            div = document.getElementById("GroupCheckboxDiv" + j.toString());
        }
    }
}

function selectAll() {
    checkboxes = document.getElementsByName('group-check');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = checked_button;
    }
}

// Changes index to prioritised group
function findGroupIndex(groupsList) {
    var index = groupsList.findIndex((element) => element === focus_group_id.toString());
    if (index === -1) {
        return 0
    }
    return index
}

function appendLabel(circle) {
    label_show = true
    var lables = circle.append("text")
        .text(function (d) {
            return d.name.replace(".xml","").replace("-",".").replace("_","/");
        }).on('click', function(d) {
            window.open(d.url, '_blank').focus()
        })
        .attr('x', 6)
        .attr('y', 3);
}


