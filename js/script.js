async function getJSON() {
  const response = await fetch("../settings.json");
  const json = await response.json();
  return json;
}

async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({ active: true })
  return tabs[0].url
}

async function fetchPageSpeedData(strategy = 'desktop') {
  const settings = await getJSON();
  const url = await getCurrentTabUrl();

  const data = fetch(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?key=" + settings.google_api_key + "&strategy=" + strategy + "&url=" + url,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json;charset=UTF-8"
      },
    }
  )
    .then((response) => response.json())
    .then((json) => {
      return json;
    })
    .catch((err) => console.log(err));

  return data;
}

async function fetchData() {
  const desktop = await fetchPageSpeedData();
  if (desktop.error?.code === 400) {
    document.querySelector("#result").innerHTML = "<p class='error'>Invalid website URL</p>";
  }
  else {
    const mobile = await fetchPageSpeedData('mobile');

    const website_url = desktop['lighthouseResult']['requestedUrl'];
    const d_score = desktop['lighthouseResult']['categories']['performance']['score'] * 100;
    const d_fcp = desktop['lighthouseResult']['audits']['metrics']['details']['items'][0]['firstContentfulPaint'] / 1000 + " s";
    const d_spi = desktop['lighthouseResult']['audits']['metrics']['details']['items'][0]['speedIndex'] / 1000 + " s";
    const d_tti = desktop['lighthouseResult']['audits']['metrics']['details']['items'][0]['interactive'] / 1000 + " s";

    const m_score = mobile['lighthouseResult']['categories']['performance']['score'] * 100;
    const m_fcp = mobile['lighthouseResult']['audits']['metrics']['details']['items'][0]['firstContentfulPaint'] / 1000 + " s";
    const m_spi = mobile['lighthouseResult']['audits']['metrics']['details']['items'][0]['speedIndex'] / 1000 + " s";
    const m_tti = mobile['lighthouseResult']['audits']['metrics']['details']['items'][0]['interactive'] / 1000 + " s";

    let html = `<div class="text-center">
    <div class="progress" data-percentage="${d_score}">
      <span class="progress-left">
        <span class="progress-bar"></span>
      </span>
      <span class="progress-right">
        <span class="progress-bar"></span>
      </span>
      <div class="progress-value">
        <div>
        ${d_score}%<br>
          <span>Desktop</span>
        </div>
      </div>
    </div>
    <div class="progress" data-percentage="${m_score}">
      <span class="progress-left">
        <span class="progress-bar"></span>
      </span>
      <span class="progress-right">
        <span class="progress-bar"></span>
      </span>
      <div class="progress-value">
        <div>
        ${m_score}%<br>
          <span>Mobile</span>
        </div>
      </div>
    </div>
  </div>

  <table>
    <tbody>
      <tr>
        <th>Website URL</th>
        <td>${website_url}</td>
      </tr>
    <tbody>
      <tr>
        <th>Desktop: First Contentful Paint</th>
        <td>${d_fcp}</td>
      </tr>
      <tr>
        <th>Desktop: Speed Index</th>
        <td>${d_spi}</td>
      </tr>
      <tr>
        <th>Desktop: Time to Interactive</th>
        <td>${d_tti}</td>
      </tr>
      <tr>
        <th>Mobile: First Contentful Paint</th>
        <td>${m_fcp}</td>
      </tr>
      <tr>
        <th>Mobile: Speed Index</th>
        <td>${m_spi}</td>
      </tr>
      <tr>
        <th>Mobile: Time to Interactive</th>
        <td>${m_tti}</td>
      </tr>
    </tbody>
  </table>`;

    document.querySelector("#result").innerHTML = html;

    let bars = document.getElementsByClassName('progress');
    for (let i = 0; i < bars.length; i++) {
      let percentage = bars[i].dataset.percentage;
      let degrees = (360 / 100) * percentage;
      let right = bars[i].getElementsByClassName('progress-right')[0].getElementsByClassName('progress-bar');
      let left = bars[i].getElementsByClassName('progress-left')[0].getElementsByClassName('progress-bar');
      if (percentage <= 50) {
        right[0].style.transform = 'rotate(' + degrees + 'deg)'
        left[0].style.transform = 'rotate(0deg)'
      } else {
        right[0].style.transform = 'rotate(180deg)'
        left[0].style.transform = 'rotate(' + degrees / 2 + 'deg)'
      }
    }
  }
}

fetchData();