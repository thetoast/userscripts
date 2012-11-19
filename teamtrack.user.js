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
    $(".listrow0").each(function () {
        var url = "tmtrack.dll?IssuePage&TableId=1&RecordId={id}&Template=viewbody";
        var href = $("a", this).attr("href");
        var split = href.split(/\?|&/);
        var recordId;

        split.forEach(function (item) {
            if (/RecordId/.test(item)) {
                recordId = item.split("=")[1];
            }
        });

        var $node = $("td:nth-child(4)", this);
        function setStatus(priority, severity) {
            $node.before($("<td>", {
                text: priority,
                "class": "listField3",
                valign: "top"
            }));
            $node.before($("<td>", {
                text: severity,
                "class": "listField3",
                valign: "top"
            }));
        }

        if (recordId) {
            url = url.replace("{id}", recordId);
            $.ajax({
                url: url,
                dataType: "html",
                success: function (data) {
                    var priority, severity;
                    $(".ttfieldname", data).each(function () {
                        if (/Severity/.test($(this).text())) {
                            severity = $(this).next().text().trim();
                        } else if (/Priority/.test($(this).text())) {
                            priority = $(this).next().text().trim();
                        }
                    });
                    setStatus(priority, severity);
                }
            });
        }
    });
}

injectScripts(main);
