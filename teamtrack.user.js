// ==UserScript==
// @name TeamTrack useful-ifier
// @namespace http://thetoast.net/gmscripts
// @version 0.1
// @match http://*/tmtrack/tmtrack.dll?ReportPage*
// ==/UserScript==

// load the jquery and jquery ui scripts
function injectScripts(callback) {
    var jquery = document.createElement('script');
    jquery.type = 'text/javascript';
    jquery.src = 'http://code.jquery.com/jquery-1.8.3.js';
    jquery.addEventListener('load', function () {
        var jqueryui = document.createElement('script');
        jqueryui.type = 'text/javascript';
        jqueryui.src = 'http://code.jquery.com/ui/1.9.1/jquery-ui.js';
        jqueryui.addEventListener('load', function () {
            var myScript = document.createElement("script");
            myScript.textContent = "(" + callback.toString() + ")();";
            document.body.appendChild(myScript);
        });
        document.body.appendChild(jqueryui);
    });
    document.body.appendChild(jquery);
}

function main() {
    function insertStylesheets() {

        // custom styling
        $(document.body).append($("<style>", {
            text:
                ".listrow-header { " +
                    "background-color: grey;" +
                    "font-weight: bold;" +
                "}" +
                ".mytooltip { " +
                    "background-color: #ddd;" +
                    "background-image: none;" +
                    "font-size: 0.9em;" +
                    "max-width: 50%;" +
                "}"
        }));

        // jquery ui stylesheet
        $(document.head).append($("<link>", {
            rel: "stylesheet",
            href: "http://code.jquery.com/ui/1.9.1/themes/base/jquery-ui.css"
        }));
    }

    // inserts the table header for the issue list view
    function insertHeader() {
        $header = $("<tr>");
        $(".listrow0").first().before($header);
        $("<th>", {
            colspan: 3,
            class: "listrow-header"
        }).appendTo($header);
        $("<th>", {
            text: "Priority",
            class: "listrow-header"
        }).appendTo($header);
        $("<th>", {
            text: "Severity",
            class: "listrow-header"
        }).appendTo($header);
        $("<th>", {
            text: "Description",
            class: "listrow-header"
        }).appendTo($header);
    }

    function initTooltip($node, tooltipText) {
        $node.tooltip({
            delay: 2000,
            items: "a",
            position: {
                my: "left+15 center",
                at: "right center",
                within: document.body
            },
            tooltipClass: "mytooltip",
            content: tooltipText
        });
    }

    function insertColumns($node, priority, severity) {
        $node.before($("<td>", {
            text: priority,
            class: "listField3",
            valign: "top"
        }));
        $node.before($("<td>", {
            text: severity,
            class: "listField3",
            valign: "top"
        }));
    }

    /*
     * Main code starts here
     */
    insertStylesheets();

    insertHeader();

    // do ajax queries and get data for each item in the list
    $(".listrow0").each(function () {
        var $anchorTag = $("a", this);
        var $descCell = $("td:nth-child(4)", this);
        var url = "tmtrack.dll?IssuePage&TableId=1&RecordId={id}&Template=viewbody";
        var recordId;

        // extract RecordID from bug url
        $anchorTag.attr("href").split(/\?|&/).forEach(function (item) {
            if (/RecordId/.test(item)) {
                recordId = item.split("=")[1];
                return false;
            }
        });

        // modify the table row if we extracted the RecordID param
        if (recordId) {
            url = url.replace("{id}", recordId);

            // lookup the interesting fields for each issue
            $.ajax({
                url: url,
                dataType: "html",
                success: function (data) {
                    var priority, severity, description;

                    // find priority and severity fields
                    $(".ttfieldname", data).each(function () {
                        if (/Severity/.test($(this).text())) {
                            severity = $(this).next().text().trim();
                        } else if (/Priority/.test($(this).text())) {
                            priority = $(this).next().text().trim();
                        } else if (/Description/.test($(this).text())) {
                            description = $(this).next().html();
                        }

                    });

                    // set status
                    insertColumns($descCell, priority, severity);
                    initTooltip($anchorTag, description);
                }
            });
        }
    });
}

injectScripts(main);
