document.addEventListener('DOMContentLoaded', function () {
    pbEvents.subscribe('pb-login', null, function(ev) {
        if (ev.detail.userChanged) {
            pbEvents.emit('pb-search-resubmit', 'search');
        }
    });

    /* Parse the content received from the server */
    pbEvents.subscribe('pb-results-received', 'search', function(ev) {
        const { content } = ev.detail;
        /* Check if the server passed an element containing the current 
           collection in attribute data-root */
        const root = content.querySelector('[data-root]');
        const currentCollection = root ? root.getAttribute('data-root') : "";
        const writable = root ? root.classList.contains('writable') : false;
        
        /* Report the current collection and if it is writable.
           This is relevant for e.g. the pb-upload component */
        pbEvents.emit('pb-collection', 'search', {
            writable,
            collection: currentCollection
        });
        /* hide any element on the page which has attribute can-write */
        document.querySelectorAll('[can-write]').forEach((elem) => {
            elem.disabled = !writable;
        });

        /* Scan for links to collections and handle clicks */
        content.querySelectorAll('[data-collection]').forEach((link) => {
            link.addEventListener('click', (ev) => {
                ev.preventDefault();

                const collection = link.getAttribute('data-collection');
                // write the collection into a hidden input and resubmit the search
                document.querySelector('.options [name=collection]').value = collection;
                pbEvents.emit('pb-search-resubmit', 'search');
            });
        });
    });

    const facets = document.querySelector('.facets');
    if (facets) {
        facets.addEventListener('pb-custom-form-loaded', function(ev) {
            const elems = ev.detail.querySelectorAll('.facet');
            // add event listener to facet checkboxes
            elems.forEach(facet => {
                facet.addEventListener('change', () => {
                    if (!facet.checked) {
                        pbRegistry.state[facet.name] = null;
                    }
                    const table = facet.closest('table');
                    if (table) {
                        const nested = table.querySelectorAll('.nested .facet').forEach(nested => {
                            if (nested != facet) {
                                nested.checked = false;
                            }
                        });
                    }
                    facets.submit();
                });
            });

            ev.detail.querySelectorAll('pb-combo-box').forEach((select) => {
                select.renderFunction = (data, escape) => {
                    if (data) {
                        return `<div>${escape(data.text)} <span class="freq">${escape(data.freq || '')}</span></div>`;
                    }
                    return '';
                }
            });
        });

        // if there's a combo box, synchronize any changes to it with existing checkboxes
        pbEvents.subscribe('pb-combo-box-change', null, function(ev) {
            const parent = ev.target.parentNode;
            const values = ev.detail.value;
            // walk through checkboxes and select the ones in the combo box
            parent.querySelectorAll('.facet').forEach((cb) => {
                const idx = values.indexOf(cb.value);
                cb.checked =  idx > -1;
                if (cb.checked) {
                    values.splice(idx, 1);
                }
            });
            // add a hidden input for any facet value which is not in the checkbox list
            // the hidden inputs will be removed again when display refreshes
            values.forEach((value) => {
                const hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = parent.dataset.dimension;
                hidden.value = value;
                parent.appendChild(hidden);
            });
            facets.submit();
        });
    }
        /**
   * Retrieve search parameters from URL
   */
    function getUrlParameter(sParam) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.getAll(sParam);
    }

    // search options: handle genre checkboxes
    const bearbeitungstext = document.getElementById("bearbeitungstext");
    let submit = false;

    function checkRequiredSubtypes() {
        // at least one Bearbeitungstext subtype is selected
        if (document.querySelector(".bearbeitungstext[checked]")) {
            return;
        }
        document.getElementById('editionstext').checked = true;
    }

    if (bearbeitungstext) {
        const checkboxes = document.querySelectorAll(".bearbeitungstext");
        // click on Bearbeitungstext selects/deselects all subtypes
        bearbeitungstext.addEventListener("click", () => {
            submit = false;
            checkboxes.forEach((item) => {
                item.checked = bearbeitungstext.checked;
            });
            checkRequiredSubtypes();
            pbEvents.emit('pb-search-resubmit', 'search');
            submit = true;
        });

        // initialize checkboxes from URL
        const subtypes = getUrlParameter('subtype');
        if (subtypes && subtypes.length > 0) {
            subtypes.forEach((subtype) => {
                document.querySelector(`paper-checkbox[value=${subtype}]`).checked = true;
            });
            bearbeitungstext.checked = !document.querySelector(".bearbeitungstext:not([checked])");
            document.getElementById('editionstext').checked = subtypes.includes('edition');
        } else {
            // no subtypes in URL: enable all checkboxes
            bearbeitungstext.checked = true;
            document.getElementById('editionstext').checked = true;
            checkboxes.forEach((item) => {
                item.checked = true;
            });
        }
        checkRequiredSubtypes();
        submit = true;

        // for each subtype we need to enable/disable the broader Bearbeitungstext checkbox
        checkboxes.forEach((item) => {
            item.addEventListener("iron-change", (ev) => {
                if (submit) {
                    checkRequiredSubtypes();
                    if (document.querySelector(".bearbeitungstext:not([checked])")) {
                        bearbeitungstext.checked = false;
                    } else {
                        bearbeitungstext.checked = true;
                    }
                    pbEvents.emit('pb-search-resubmit', 'search');
                }
            });
        });
        document.getElementById('editionstext').addEventListener('click', () => {
            if (!document.querySelector(".bearbeitungstext[checked]")) {
                document.getElementById('editionstext').checked = true;
                return;
            }
            if (submit) {
                pbEvents.emit('pb-search-resubmit', 'search');
            }
        });
    } 
});