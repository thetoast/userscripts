// ==UserScript==
// @name TeamTrack useful-ifier
// @namespace http://thetoast.net/gmscripts
// @version 0.1
// @match http://*/tmtrack/tmtrack.dll?ReportPage*
// ==/UserScript==

function injectScripts(callback) {
    console.log("injecting jquery");
    var jquery = document.createElement('script');
    jquery.type = 'text/javascript';
    jquery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';
    jquery.addEventListener('load', function () {
        var myScript = document.createElement("script");
        myScript.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(myScript);
    });
    document.body.appendChild(jquery);
}

function main() {
    console.log("TeamTrack script running");

    // insert stylesheet
    $(document.body).append($("<style>", {
        text: ".listrow-header { background-color: grey; font-weight: bold; }"
    }));

    // insert header row
    $header = $("<tr>");
    console.log($(".listrow0"));
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
        var href = $("a", this).attr("href");
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
