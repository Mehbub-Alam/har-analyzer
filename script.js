// document.getElementById("uniqueUrls").value = "Fetch me a Har File";

let dataTable;
let harEntries = [];

document
  .getElementById("harFileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
    // console.log(file.name);

    document.getElementById("selected-file").innerHTML = "✔️" + file.name;

    document.getElementById("svg-left").style.display = "none";
    document.getElementById("svg-right").style.display = "none";
    document.getElementById("svg-left-top").style.display = "block";
    document.getElementById("svg-right-top").style.display = "block";
    document.getElementById("svg-right-top").style.display = "block";
    document.getElementById("mid-svg").style.display = "none";

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
      document.getElementById("uniqueUrls").value = sortedDomains.join("\n");

      const tableData = harEntries.map((entry) => {
        const req = entry.request;
        const res = entry.response;
        // const remoteAddress = entry.serverIPAddress || "N/A";
        const ip = entry.serverIPAddress || "N/A";
        const httpVersion = entry.request.httpVersion || "N/A";

        // This is the list for Network label used to identify the network route - Proxied, Internal, Through NEE network, PZens etc
        const cidrGroups = [
          {
            label: "Company Network",
            cidrs: ["155.109.0.0/16", "155.110.0.0/16", "203.0.113.10"], // Single IP allowed
          },
          {
            label: "Internal VPN",
            cidrs: ["10.10.0.0/16", "10.20.0.0/16", "142.250.205.3"],
          },
          {
            label: "Office LAN",
            cidrs: ["192.168.1.0/24", "192.168.2.0/24", "172.16.5.5"],
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
          {
            label: "GRE Tunnel Zscaler",
            cidrs: [
              "185.46.212.88",
              "185.46.212.89",
              "185.46.212.90",
              "185.46.212.91",
              "185.46.212.92",
              "185.46.212.93",
              "185.46.212.97",
              "185.46.212.98",
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

      // document.getElementById("display-table").style.display = "block";
      document.getElementsByClassName("display-table")[0].style.display =
        "block";

      if (dataTable) {
        dataTable.clear().rows.add(tableData).draw();
      } else {
        dataTable = $("#myTable").DataTable({
          className: "dt-body-left hover compact column-border stripe",
          targets: "_all",
          autoWidth: false,
          data: tableData,
          columns: [
            { title: "URL", className: "url-col" },
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

      // document.getElementById("domain-header").innerHTML =
      //   "Extracted Unique Domains:";
    };

    // copyUrls();

    reader.readAsText(file);
    // document.getElementById("btn-copy-url").disabled = false;
    document.getElementById("btn-unique-domain").disabled = false;
    // document
    //   .getElementById("btn-unique-domain")
    //   .classList.add("btn-unique-domain-bg");
  });

function openModal() {
  const text = document.getElementById("uniqueUrls").value;

  document.getElementById("myModal").style.display = "block";
}

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
