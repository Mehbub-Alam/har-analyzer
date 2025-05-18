// document.getElementById("uniqueUrls").value = "Fetch me a Har File";

let dataTable;
let dataTableRedirect;
let harEntries = [];
const seenRows = new Set();
const uniqueRedirectedDomains = new Set();
let redirectFlag = false;
// location.reload();

document
  .getElementById("harFileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
    // console.log(file.name);
    // seenRows.clear();
    // console.log(seenRows);

    // const seenRows = new Set();

    // alert("hello mehbuba");

    document.getElementById("selected-file").innerHTML = "✔️" + file.name;
    document.getElementById("redirectBox").style.display = "none";

    document.getElementById("svg-left").style.display = "none";
    document.getElementById("svg-right").style.display = "none";
    document.getElementById("svg-left-top").style.display = "block";
    document.getElementById("svg-right-top").style.display = "block";
    // document.getElementById("svg-right-top").style.display = "block";
    document.getElementById("mid-svg").style.display = "none";
    document.getElementById("btn-unique-domain").style.display = "inline";
    document.getElementById("btn-redirect").style.display = "inline";

    const reader = new FileReader();
    reader.onload = function (e) {
      const har = JSON.parse(e.target.result);
      harEntries = har.log.entries;

      //   console.log(harEntries);
      const domainSet = new Set(
        harEntries.map((entry) => {
          try {
            const url = new URL(entry.request.url); // Extract domain from URL
            // console.log("Hello Mehbub");
            return url.hostname; // Only the domain part (hostname)
          } catch (e) {
            return ""; // In case of invalid URLs
          }
        })
      );

      const sortedDomains = Array.from(domainSet).sort();
      // console.log(typeof sortedDomains);
      // console.log(typeof domainSet);
      document.getElementById("uniqueUrls").value = sortedDomains.join("\n");

      const tableData = harEntries.map((entry) => {
        const req = entry.request;
        const res = entry.response;
        // const remoteAddress = entry.serverIPAddress || "N/A";
        const ip = entry.serverIPAddress || "N/A";
        const httpVersion = entry.request.httpVersion || "N/A";
        // const location = entry.response.headers.name.location || "N/A";

        // This function returns the header name and value we want. for eg - location: http://google.com or referer: http: gateway.zscalerthree.net
        function getHeaderValue(headers, key) {
          const header = headers.find(
            (h) => h.name.toLowerCase() === key.toLowerCase()
          );
          return header ? header.value : null;
        }

        // Private IP ranges defined from the PAC file Regex

        // 0.0.0.0/8
        // 10.0.0.0/8 //CLass A private
        // 127.0.0.0/8 // loopback
        // 155.109.0.0/16 (Assumed /16 based on common usage for two octets)
        // 161.154.0.0/16 (Assumed /16 based on common usage for two octets)
        // 192.168.0.0/16 // Class C Private
        // 172.16.0.0/12 // Class B Private
        // 169.254.0.0/16 //This covers the 169.254.0.0/16 link-local (APIPA) address range.
        // 192.88.99.0/24 //This is the 192.88.99.0/24 range, which was previously used for IPv6 to IPv4 relay.

        //AWS internal network
        // 10.196.0.0/19
        // 10.193.252.0/22

        // This is the list for Network label used to identify the network route - Proxied, Internal, Through NEE network, PZens etc

        const cidrGroups = [
          {
            label: "LCPzen",
            cidrs: ["155.109.178.0/24"],
          },
          {
            label: "GOPzen",
            cidrs: ["155.109.8.0/24"],
          },
          {
            label: "EVAPzen",
            cidrs: ["155.109.64.0/24"],
          },
          {
            label: "VPN",
            cidrs: ["172.29.0.0/16", "172.30.0.0/15"],
          },
          {
            label: "Company Network",
            cidrs: ["155.109.0.0/16", "161.154.0.0/16", "203.0.113.10"], // Single IP allowed
          },
          {
            label: "Internal Private",
            cidrs: [
              "10.0.0.0/8",
              // "0.0.0.0/8",
              "192.168.0.0/16",
              "172.16.0.0/12",
              "169.254.0.0/16", //  link-local (APIPA) address range
              "192.88.99.0/24", // used for IPv6 to IPv4 relay.
            ],
          },
          {
            label: "Localhost loopback",
            cidrs: ["127.0.0.0/8"],
          },
          {
            label: "AWS Internal",
            cidrs: ["10.196.0.0/19", "10.193.252.0/22"],
          },

          {
            label: "GRETunnel",
            cidrs: ["185.46.212.91", "185.46.212.90"],
          },

          {
            label: "Zscaler Cloud",
            cidrs: [
              "58.220.95.0/24",
              "64.215.22.0/24",
              "87.58.64.0/18",
              "94.188.131.0/25",
              "94.188.139.64/26",
              "94.188.248.64/26",
              "98.98.26.0/24",
              "98.98.27.0/24",
              "98.98.28.0/24",
              "101.2.192.0/18",
              "104.129.192.0/20",
              "112.137.170.0/24",
              "124.248.141.0/24",
              "128.177.125.0/24",
              "136.226.0.0/16",
              "137.83.128.0/18",
              "140.210.152.0/23",
              "147.161.128.0/17",
              "154.113.23.0/24",
              "165.225.0.0/17",
              "165.225.192.0/18",
              "167.103.0.0/16",
              "170.85.0.0/16",
              "185.46.212.0/22",
              "194.9.96.0/20",
              "194.9.112.0/22",
              "194.9.116.0/24",
              "196.23.154.64/27",
              "196.23.154.96/27",
              "197.98.201.0/24",
              "197.156.241.224/27",
              "198.14.64.0/18",
              "199.168.148.0/23",
              "209.55.128.0/18",
              "209.55.192.0/19",
              "211.144.19.0/24",
              "220.243.154.0/23",
              "221.122.91.0/24",
              "2605:4300::/32",
              "2a03:eec0::/32",
              "2400:7aa0::/32",
              "205.220.0.0/17",
              "167.106.0.0/16",
              "103.215.126.0/24",
            ],
          },
        ];

        // Calling function to check the remote IP against Network IPS ranges defined for Zscaler, Internal or PZens route. This gives us the label
        const label = getCidrLabelForIp(ip, cidrGroups);
        const output = label ? `${ip} (${label})` : ip;

        return [
          `<span title="${req.url}">${req.url}</span>`,
          res.status,
          req.method,
          output,
          // res.bodySize, // We can use this for size of the call
          entry.time.toFixed(1),
          httpVersion,
        ];
      });

      // Modal Redirect Table
      // console.log(harEntries);

      document
        .getElementById("btn-redirect")
        .addEventListener("click", getRedirectData);

      // document.getElementById("display-table").style.display = "block";
      document.getElementsByClassName("display-table")[0].style.display =
        "block";

      if (dataTable) {
        dataTable.clear().rows.add(tableData).draw();
      } else {
        dataTable = $("#myTable").DataTable({
          className: "dt-body-left hover  column-border stripe",
          targets: "_all",
          autoWidth: false,
          data: tableData,
          columns: [
            { title: "URL", className: "url-col wrap-text-column" },
            { title: "Status" },
            { title: "Method" },
            { title: "Remote Address" },
            { title: "Time (ms)" },
            { title: "Protocol" },
          ],
          pageLength: 10,
          order: [[5, "desc"]],
          initComplete: function () {
            $("#myTable").colResizable({
              liveDrag: true,
              gripInnerHtml: "<div class='grip'></div>",
              draggingClass: "dragging",
            });
          },
        });
      }
    };

    reader.readAsText(file);
    // document.getElementById("btn-copy-url").disabled = false;
    document.getElementById("btn-unique-domain").disabled = false;
  });

function copyUrls() {
  const text = document.getElementById("uniqueUrls").value;

  // document.getElementById("btn-copy-url").innerHTML = "📋 Copied";

  document.getElementById("myModal").style.display = "block";

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(
        () =>
          (document.getElementById("modal-message").innerHTML =
            "✅ Domains copied to clipboard!")
      )
      .catch(
        (err) =>
          (document.getElementById("modal-message").innerHTML =
            "❌ Failed to copy: " + err)
      );
    // setTimeout(() => {
    //   document.getElementById("btn-copy-url").innerHTML = "📋 Copy";
    // }, 2000);
  } else {
    document.getElementById("modal-message").innerHTML =
      "❌ la Clipboard API not supported in this browser.";
  }

  const span = document.getElementsByClassName("close")[0];

  span.onclick = function () {
    document.getElementById("myModal").style.display = "none";
  };
}

// Function to check the remote IP agains our prefined list for GRE tunnel, Zscaler cloud, Pzens, nextera network

function getCidrLabelForIp(ip, cidrGroups) {
  if (ip.includes(":")) return null; // Skip IPv6

  const ipToInt = (ip) =>
    ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);

  const ipInt = ipToInt(ip);

  for (const group of cidrGroups) {
    for (const cidrOrIp of group.cidrs) {
      if (!cidrOrIp.includes("/")) {
        // Single IP match
        if (cidrOrIp === ip) return group.label;
      } else {
        // CIDR match using IP to int
        const [range, bits = "32"] = cidrOrIp.split("/");
        const rangeInt = ipToInt(range);
        const mask = ~(2 ** (32 - parseInt(bits)) - 1);

        //Bitwise AND to match the network part and return the label
        if ((ipInt & mask) === (rangeInt & mask)) {
          return group.label;
        }
      }
    }
  }

  return null;
}

// This function is called when we click 307 redirects  the HAR file
function getRedirectData() {
  redirectFlag = false;
  document.getElementById("redirectBox").style.display = "inline";

  seenRows.clear();
  uniqueRedirectedDomains.clear();
  console.log(seenRows);
  document.getElementById("redirectModal").style.display = "inline";

  const redirectTableData = harEntries
    .filter((entry) => {
      // First, ensure entry.response exists and its status is "307"
      if (!entry.response || entry.response.status !== 307) {
        return false; // Skip if not a 307 response
      }

      // Extract location and referer early to check for 'zscaler'
      // Use getHeaderValue which you've already defined, or direct access with nullish coalescing
      const resHeaders = entry.response.headers || [];
      const reqHeaders = entry.request.headers || [];

      function getHeaderValue(headers, key) {
        const header = headers.find(
          (h) => h.name.toLowerCase() === key.toLowerCase()
        );
        return header ? header.value : null;
      }

      const location = getHeaderValue(resHeaders, "location");
      const referer = getHeaderValue(reqHeaders, "referer");

      // Check if location OR referer contains "zscaler" (case-insensitive)
      const locationContainsZscaler =
        location && location.toLowerCase().includes("zscaler");
      const refererContainsZscaler =
        referer && referer.toLowerCase().includes("zscaler");

      // console.log(refererContainsZscaler);
      // console.log(locationContainsZscaler);

      // Return true if it's a 307 AND (location contains "zscaler" OR referer contains "zscaler")
      return locationContainsZscaler || refererContainsZscaler;
    })
    .map((entry) => {
      // Re-extract these values inside map, or pass them through if filter allows
      // For clarity, re-extracting for the map's purpose is fine.
      const req = entry.request;
      const res = entry.response;

      function getHeaderValue(headers, key) {
        const header = headers.find(
          (h) => h.name.toLowerCase() === key.toLowerCase()
        );
        return header ? header.value : null;
      }

      const referer = getHeaderValue(req.headers, "referer");
      const location = getHeaderValue(res.headers, "location");
      const url = req.url;

      let domain = "N/A";
      if (url) {
        try {
          const urlObj = new URL(url);
          domain = urlObj.hostname;
        } catch (e) {
          console.error("Error parsing URL for domain:", url, e);
          domain = "Invalid URL";
        }
      }

      // --- Deduplication Logic (remains the same as before) ---
      const uniqueRowKey = `${location}|||${domain}|||${referer}`;

      uniqueRedirectedDomains.add(domain);

      console.log("Ma ma mia");
      console.log(uniqueRedirectedDomains);
      console.log("Ma ma ia");

      if (seenRows.has(uniqueRowKey)) {
        return null;
      } else {
        seenRows.add(uniqueRowKey);
        return [
          `<span title="${domain}">${domain}</span>`,
          res.status,
          location,
          referer,
        ];
      }
      // --- End Deduplication Logic ---
    })
    .filter((row) => row !== null); // Filter out any 'null' values from deduplication

  console.log(`Mehbbub` + redirectFlag);

  // ... (rest of your DataTables initialization/update logic) ...
  if (redirectTableData.length > 0) {
    document.getElementsByClassName("redirect-footer")[0].style.display =
      "inline";
    document.getElementById("copyRedirectedDomain").disabled = false;
    const redirectHeader = document.getElementById("redirect-comment");
    redirectHeader.innerHTML = "Zscaler 307 Redirects";
    redirectHeader.classList.remove("style-redirect-header");

    console.log("me:");

    if (dataTableRedirect) {
      console.log(typeof dataTableRedirect);
      console.log(`Mehbub table: ` + redirectFlag);
      redirectFlag = true;

      dataTableRedirect.clear().rows.add(redirectTableData).draw();
      // alert(redirectTableData);
    } else {
      // alert("Else");
      dataTableRedirect = $("#redirect-table").DataTable({
        className: "dt-body-left hover compact column-border stripe",
        targets: "_all",
        autoWidth: false,
        data: redirectTableData,
        columns: [
          { title: "Domain" },
          { title: "Status" },
          { title: "Location", className: "wrap-text-column" },
          { title: "Referer", className: "wrap-text-column" },
        ],
        pageLength: 10,
        order: [[3, "desc"]],
        initComplete: function () {
          $("#redirect-table").colResizable({
            liveDrag: true,
            gripInnerHtml: "<div class='grip'></div>",
            draggingClass: "dragging",
          });
        },
      });
    }
  } else {
    document
      .getElementById("redirectBoxWrapper")
      .classList.add("reduced-height");
    document.getElementById("redirectBox").style.display = "none";
    document.getElementsByClassName("redirect-footer")[0].style.display =
      "none";
    // document.getElementById("redirect-footer").style.display = "none";
    const redirectHeaderText = document.getElementById("redirect-comment");

    redirectHeaderText.innerHTML = "No Zscaler redirect seen with 307";
    redirectHeaderText.classList.add("style-redirect-header");
    seenRows.clear();
    uniqueRedirectedDomains.clear();
  }
}

// document
//   .getElementById("copyRedirectedDomain")
//   .addEventListener("click", copyFromSet(uniqueRedirectedDomains));

document.addEventListener("DOMContentLoaded", () => {
  const copyRedirectedDomainButton = document.getElementById(
    "copyRedirectedDomain"
  );

  if (copyRedirectedDomainButton) {
    copyRedirectedDomainButton.addEventListener("click", () => {
      // When the button is clicked, this anonymous function will execute.
      // It will then call copyFromSet, passing the uniqueRedirectedDomains Set.
      copyFromSet(uniqueRedirectedDomains);
    });
  } else {
    console.error("Button with ID 'copyRedirectedDomain' not found!");
  }
});

// function copyFromSet(mySet) {
//   const stringArrayDomains = Array.from(mySet);
//   const contentToCopy = stringArrayDomains.join("\n"); // Joining with a newline for each item

//   if (navigator.clipboard) {
//     navigator.clipboard
//       .writeText(contentToCopy)
//       .then(
//         () =>
//           (document.getElementById("copyRedirectedDomain").innerHTML =
//             "✅ Domains copied to clipboard!")
//       )
//       .catch(
//         (err) =>
//           (document.getElementById("copyRedirectedDomain").innerHTML =
//             "❌ Failed to copy: " + err)
//       );
//     // setTimeout(() => {
//     //   document.getElementById("btn-copy-url").innerHTML = "📋 Copy";
//     // }, 2000);
//   } else {
//     document.getElementById("modal-message").innerHTML =
//       "❌ la Clipboard API not supported in this browser.";
//   }
// }

function copyFromSet(mySet) {
  // mySet will now receive uniqueRedirectedDomains when called by the click event
  const stringArrayDomains = Array.from(mySet);
  const contentToCopy = stringArrayDomains.join("\n");

  const copyButton = document.getElementById("copyRedirectedDomain");

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => {
        copyButton.innerHTML = "✅ Domains copied!"; // Changed text for consistency
        // Reset button text after a short delay
        setTimeout(() => {
          copyButton.innerHTML = "Copy Redirected Domain"; // Or your original text
        }, 2000);
      })
      .catch((err) => {
        let errorMessage = "❌ Failed to copy";
        if (err.name === "NotAllowedError") {
          errorMessage +=
            ": NotAllowedError: Document not focused or permission denied.";
        } else {
          errorMessage += `: ${err.message}`;
        }
        copyButton.innerHTML = errorMessage;
        console.error("Failed to copy: ", err); // Log the full error for debugging

        // Reset button text after a short delay for error messages
        setTimeout(() => {
          copyButton.innerHTML = "Copy Unique Domains"; // Or your original text
        }, 3000);
      });
  } else {
    copyButton.innerHTML = "❌ Clipboard API not supported!"; // Changed to reflect button
    console.error("Clipboard API not supported in this browser.");
  }
}

const spanRedirect = document.getElementById("closeRedirectBox");
spanRedirect.onclick = function () {
  document.getElementById("redirectModal").style.display = "none";
  // seenRows.clear();
};
