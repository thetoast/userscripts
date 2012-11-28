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

    /*
     * Main code starts here
     */
    insertStylesheets();

    // do ajax queries and get data for each item in the list
    $("a[href*=IssuePage]").each(function () {
        var $anchorTag = $(this);
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

                    // find issue field values
                    $(".ttfieldname", data).each(function () {
                        if (/Description/.test($(this).text())) {
                            description = $(this).next().html();
                        }
                    });

                    // look for attachments
                    var hasAttachments = false;
                    var $attchSection;
                    $(".sectionLabel", data).each(function () {
                        if ($(this).text() === "Attachments") {
                            hasAttachments = true;
                            $attchSection = $(this);
                        }
                    });

                    if (hasAttachments) {
                        var $attch = $("<a>", {
                            text: "Attch",
                            href: "#"
                        });
                        $anchorTag.after($attch);
                        $anchorTag.after("&nbsp;&nbsp;&nbsp;&nbsp;");

                        var $pics = $("img[src*=AttachmentPage]", $attchSection.parent().parent().next());

                        $attch.tooltip({
                            items: "a",
                            position: {
                                my: "left+15 center",
                                at: "right center",
                                within: document.body
                            },
                            tooltipClass: "mytooltip",
                            content: function () {
                                // create a div to hold our stuff
                                var $adiv = $("<div>", {
                                    html: "Attachments: <br />"
                                });

                                // insert a tag for each picture attachment
                                $pics.each(function () {
                                    var src = $(this).attr("src");
                                    var $a = $("<a>", {
                                        text: src,
                                        href: "#"
                                    }).click(function () {
                                        if ($(this).data("img-open")) {
                                            $(this).data("img-open", false);
                                            $(this).next().remove();
                                        } else {
                                            $(this).data("img-open", true);
                                            $(this).after($("<img>", {
                                                src: src
                                            }));
                                        }
                                    });
                                    $adiv.append($a);
                                    $adiv.append("<br />");
                                });

                                // insert a close link
                                $adiv.append("<br />");
                                $adiv.append($("<a>", {
                                    text: "Close",
                                    href: "#"
                                }).click(function () {
                                    console.log("closing tooltip");
                                    $attch.trigger("click");
                                }));

                                return $adiv;
                            },
                            disabled: true
                        }).click(function () {
                            if ($(this).data("tooltip-open")) {
                                $(this).tooltip("close");
                                $(this).data("tooltip-open", false);
                            } else {
                                $(this).tooltip("open");
                                $(this).data("tooltip-open", true);
                            }
                        });
                    }

                    // set status
                    initTooltip($anchorTag, description);
                }
            });
        }
    });
}

injectScripts(main);
