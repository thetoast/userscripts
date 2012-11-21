// ==UserScript==
// @name TeamTrack useful-ifier
// @namespace http://thetoast.net/gmscripts
// @version 0.1
// @match http://*/tmtrack/tmtrack.dll?ReportPage*
// ==/UserScript==

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

    // insert stylesheet
    $(document.body).append($("<style>", {
        text:
            ".listrow-header { " +
                "background-color: grey;" +
                "font-weight: bold;" +
            "}" +
            ".tooltip { " +
                "background-color: #ddd;" +
                "border: 1px solid black;" +
                "border-radius: 5px;" +
                "font-size: 0.75em;" +
                "max-width: 75%;" +
            "}"
    }));

    // insert header row
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

    // do ajax queries and get data for each item in the list
    $(".listrow0").each(function () {
        var url = "tmtrack.dll?IssuePage&TableId=1&RecordId={id}&Template=viewbody";
        var $anchor = $("a", this);
        var href = $anchor.attr("href");
        var split = href.split(/\?|&/);
        var recordId;

        // extract RecordID from bug url
        split.forEach(function (item) {
            if (/RecordId/.test(item)) {
                recordId = item.split("=")[1];
            }
        });

        // function for adding the status columns
        var $node = $("td:nth-child(4)", this);
        function setStatus(priority, severity) {
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

        // do the actual ajax call
        if (recordId) {
            url = url.replace("{id}", recordId);

            // hook up tooltip
            $anchor.tooltip({
                delay: 2000,
                items: "a",
                content: function () {
                    var result;

                    $.ajax({
                        url: url,
                        dataType: "html",
                        async: false,
                        success: function (data) {
                            $(".ttfieldname", data).each(function () {
                                if (/Description/.test($(this).text())) {
                                    result = $(this).next().html();
                                    return false;
                                }
                            });
                        }
                    });
                    return "<div class='tooltip'>" + result + "</div>";
                }
            });

            $.ajax({
                url: url,
                dataType: "html",
                success: function (data) {
                    var priority, severity;

                    // find priority and severity fields
                    $(".ttfieldname", data).each(function () {
                        if (/Severity/.test($(this).text())) {
                            severity = $(this).next().text().trim();
                        } else if (/Priority/.test($(this).text())) {
                            priority = $(this).next().text().trim();
                        }
                    });

                    // set status
                    setStatus(priority, severity);
                }
            });
        }
    });
}

injectScripts(main);
