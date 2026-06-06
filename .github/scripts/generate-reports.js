const fs = require('fs');
const path = require('path');

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('GITHUB_TOKEN no está definido');
  process.exit(1);
}

const API_BASE = `https://api.github.com/repos/${owner}/${repo}`;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
};

async function fetchAll(endpoint) {
  let page = 1;
  let allData = [];
  while (true) {
    const url = `${API_BASE}/${endpoint}?per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    allData.push(...data);
    page++;
  }
  return allData;
}

async function generateReports() {
  const issues = await fetchAll('issues?state=closed&sort=updated&direction=desc');
  const pulls = await fetchAll('pulls?state=closed&sort=updated&direction=desc');
  const mergedPulls = pulls.filter(pr => pr.merged_at);
  const tags = await fetchAll('tags');

  const now = new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' });

  // Construcción del contenido Markdown
  let md = '# Reportes Automáticos\n\n';
  md += '_Estos reportes se actualizan automáticamente con cada despliegue._\n\n';
  md += `_Generado el ${now} (hora de Ecuador)_\n\n`;

  md += `## Issues cerrados (últimos 50)\n\n`;
  md += `| # | Título | Creado | Cerrado |\n`;
  md += `|---|--------|--------|---------|\n`;
  issues.slice(0, 50).forEach(issue => {
    md += `| [#${issue.number}](${issue.html_url}) | ${issue.title} | ${new Date(issue.created_at).toLocaleDateString()} | ${new Date(issue.closed_at).toLocaleDateString()} |\n`;
  });
  md += `\n*Total de issues cerrados: ${issues.length}*\n\n`;

  md += `## Pull Requests fusionados (últimos 50)\n\n`;
  md += `| # | Título | Fecha fusión |\n`;
  md += `|---|--------|-------------|\n`;
  mergedPulls.slice(0, 50).forEach(pr => {
    md += `| [#${pr.number}](${pr.html_url}) | ${pr.title} | ${new Date(pr.merged_at).toLocaleDateString()} |\n`;
  });
  md += `\n*Total de PRs fusionados: ${mergedPulls.length}*\n\n`;

  md += `## Tags (versiones)\n\n`;
  if (tags.length === 0) {
    md += `No hay tags todavía.\n`;
  } else {
    tags.forEach(tag => {
      const fecha = tag.commit && tag.commit.commit && tag.commit.commit.committer && tag.commit.commit.committer.date
        ? new Date(tag.commit.commit.committer.date).toLocaleDateString()
        : 'fecha desconocida';
      md += `- \`${tag.name}\` (${fecha})\n`;
    });
  }

  const outputPath = path.join(__dirname, '..', '..', 'docs', 'reportes.md');
  fs.writeFileSync(outputPath, md);
  console.log('✅ Reportes generados en docs/reportes.md');
}

generateReports().catch(err => {
  console.error('❌ Error generando reportes:', err);
  process.exit(1);
});