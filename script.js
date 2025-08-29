// Enhanced Resume Builder JavaScript

function addSkill() {
  const container = document.getElementById('skillsContainer');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'skill-input';
  input.placeholder = 'Enter a skill';
  container.appendChild(input);
}

function addExperience() {
  const container = document.getElementById('experienceContainer');
  const expItem = document.createElement('div');
  expItem.className = 'experience-item';
  expItem.innerHTML = `
    <div class="form-row">
      <input type="text" placeholder="Job Title">
      <input type="text" placeholder="Company Name">
    </div>
    <div class="form-row">
      <input type="text" placeholder="Start Date">
      <input type="text" placeholder="End Date / Present">
    </div>
    <textarea placeholder="Achievements (one per line)..." rows="3"></textarea>
  `;
  container.appendChild(expItem);
}

function addEducation() {
  const container = document.getElementById('educationContainer');
  const eduItem = document.createElement('div');
  eduItem.className = 'education-item';
  eduItem.innerHTML = `
    <div class="form-row">
      <input type="text" placeholder="Degree">
      <input type="text" placeholder="Institution">
    </div>
    <div class="form-row">
      <input type="text" placeholder="Graduation Year">
      <input type="text" placeholder="GPA (optional)">
    </div>
  `;
  container.appendChild(eduItem);
}

function addCertification() {
  const container = document.getElementById('certificationsContainer');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Certification Name';
  container.appendChild(input);
}

function updateTemplate() {
  // Clear preview and hide download button on template change
  document.getElementById('resumePreview').innerHTML = '';
  document.getElementById('downloadBtn').style.display = 'none';
}

// Utility: basic HTML escape to reduce XSS risk since we use innerHTML for preview
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function collectResumeData() {
  const resumeType = document.getElementById('resumeType').value;
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const location = document.getElementById('location').value.trim();
  const linkedin = document.getElementById('linkedin').value.trim();
  const portfolio = document.getElementById('portfolio').value.trim();
  const summary = document.getElementById('summary').value.trim();

  // Collect skills
  const skills = Array.from(document.querySelectorAll('#skillsContainer .skill-input'))
    .map(i => i.value.trim()).filter(Boolean);

  // Collect experience
  const experiences = Array.from(document.querySelectorAll('#experienceContainer .experience-item')).map(item => {
    const inputs = item.querySelectorAll('input');
    const textarea = item.querySelector('textarea');
    return {
      title: (inputs[0]?.value || '').trim(),
      company: (inputs[1]?.value || '').trim(),
      startDate: (inputs[2]?.value || '').trim(),
      endDate: (inputs[3]?.value || '').trim(),
      description: (textarea?.value || '').trim()
    };
  }).filter(e => e.title && e.company);

  // Collect education
  const educations = Array.from(document.querySelectorAll('#educationContainer .education-item')).map(item => {
    const inputs = item.querySelectorAll('input');
    return {
      degree: (inputs[0]?.value || '').trim(),
      institution: (inputs[1]?.value || '').trim(),
      graduationYear: (inputs[2]?.value || '').trim(),
      gpa: (inputs[3]?.value || '').trim()
    };
  }).filter(e => e.degree && e.institution);

  // Collect certifications
  const certifications = Array.from(document.querySelectorAll('#certificationsContainer input'))
    .map(i => i.value.trim()).filter(Boolean);

  return { resumeType, fullName, email, phone, location, linkedin, portfolio, summary, skills, experiences, educations, certifications };
}

function generateResume() {
  const data = collectResumeData();
  const { resumeType, fullName, email, phone, location, linkedin, portfolio, summary, skills, experiences, educations, certifications } = data;

  if (!fullName || !email || !phone || !location) {
    alert('Please fill in all required fields: Full Name, Email, Phone, and Location.');
    return;
  }

  // Build resume HTML
  const resumePreview = document.getElementById('resumePreview');
  resumePreview.className = 'resume-preview template-' + resumeType;
  let html = `
    <div class="resume-header">
      <div class="resume-name">${esc(fullName)}</div>
      <div class="resume-contact">${esc(email)} | ${esc(phone)} | ${esc(location)}</div>
      <div class="resume-contact">${linkedin ? 'LinkedIn: ' + esc(linkedin) : ''}${portfolio ? ' | Portfolio: ' + esc(portfolio) : ''}</div>
    </div>
  `;

  if (summary) {
    html += '<div class="resume-section resume-summary">' + esc(summary) + '</div>';
  }

  if (skills.length > 0) {
    html += '<div class="resume-section"><h3>Skills</h3><div class="skills-list">';
    skills.forEach(skill => { html += '<span class="skill-tag">' + esc(skill) + '</span>'; });
    html += '</div></div>';
  }

  if (experiences.length > 0) {
    html += '<div class="resume-section"><h3>Work Experience</h3>';
    experiences.forEach(exp => {
      // Convert description lines to bullets
      const bullets = exp.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const bulletsHtml = bullets.length ? ('<ul>' + bullets.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>') : '';
      html += `
        <div class="experience-item">
          <div class="experience-header">
            <div class="experience-title">${esc(exp.title)}</div>
            <div class="experience-date">${esc(exp.startDate)} - ${esc(exp.endDate)}</div>
          </div>
          <div class="experience-company">${esc(exp.company)}</div>
          <div class="experience-description">${bulletsHtml}</div>
        </div>
      `;
    });
    html += '</div>';
  }

  if (educations.length > 0) {
    html += '<div class="resume-section"><h3>Education</h3>';
    educations.forEach(edu => {
      html += `
        <div class="education-item">
          <div class="education-header">
            <div class="education-degree">${esc(edu.degree)}</div>
            <div class="education-date">${esc(edu.graduationYear)}</div>
          </div>
          <div class="education-institution">${esc(edu.institution)}</div>
          <div class="education-details">${edu.gpa ? 'GPA: ' + esc(edu.gpa) : ''}</div>
        </div>
      `;
    });
    html += '</div>';
  }

  if (certifications.length > 0) {
    html += '<div class="resume-section"><h3>Certifications</h3><ul>';
    certifications.forEach(cert => { html += '<li>' + esc(cert) + '</li>'; });
    html += '</ul></div>';
  }

  resumePreview.innerHTML = html;
  document.getElementById('downloadBtn').style.display = 'inline-block';

  // Trigger AI suggestions
  getJobSuggestions(data);
}

async function getJobSuggestions(profile) {
  const list = document.getElementById('aiSuggestions');
  const loading = document.getElementById('aiLoading');
  const error = document.getElementById('aiError');
  list.innerHTML = '';
  error.style.display = 'none';
  loading.style.display = 'block';

  try {
    try {
  const resp = await fetch('http://127.0.0.1:3001/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });

  if (!resp.ok) throw new Error('Server error: ' + resp.status);
  const data = await resp.json();

  if (!Array.isArray(data.roles)) throw new Error('Invalid response');
  renderSuggestions(data.roles);

} catch (e) {
  error.textContent = 'Could not fetch AI suggestions. Showing a local estimate instead.';
  error.style.display = 'block';
  // fallback logic …
}

    // Fallback simple heuristic if backend not running
    const fallback = (profile.skills || []).slice(0, 4).map((s, i) => ({
      role: profile.resumeType === 'tech' ? (['Frontend Developer', 'Backend Developer', 'IT Support Specialist', 'QA Engineer'][i] || 'Associate') :
        profile.resumeType === 'teacher' ? (['Primary School Teacher', 'High School Teacher', 'Instructional Designer', 'Academic Coordinator'][i] || 'Educator') :
          profile.resumeType === 'healthcare' ? (['Clinical Assistant', 'Nurse Associate', 'Medical Records Specialist', 'Healthcare Admin'][i] || 'Healthcare Associate') :
            profile.resumeType === 'creative' ? (['Graphic Designer', 'Content Writer', 'Social Media Manager', 'Video Editor'][i] || 'Creative Associate') :
              (['Office Administrator', 'Operations Associate', 'Customer Success Associate', 'Project Coordinator'][i] || 'Associate'),
      fit: Math.min(95, 50 + (i * 10)),
      whyGood: 'Based on your provided skills and experience.',
      gaps: 'Consider adding measurable achievements.',
      nextSteps: 'Tailor your resume keywords to the role and quantify results.'
    }));
    renderSuggestions(fallback);
  } finally {
    loading.style.display = 'none';
  }
}

function renderSuggestions(roles) {
  const list = document.getElementById('aiSuggestions');
  list.innerHTML = '';
  roles.slice(0, 4).forEach(r => {
    const card = document.createElement('div');
    card.className = 'ai-card';
    const pct = Math.max(0, Math.min(100, parseInt(r.fit || r.fitPercent || 0, 10)));
    card.innerHTML = `
      <h4>${esc(r.role || 'Suggested Role')}</h4>
      <div class="ai-fit">Fit: <strong>${pct}%</strong></div>
      <div class="ai-progress"><div style="width:${pct}%"></div></div>
      <div class="ai-good">Why you're a match: ${esc(r.whyGood || r.reason || '')}</div>
      <div class="ai-gap">How to improve: ${esc(r.gaps || r.improve || '')}</div>
      <div class="ai-next"><strong>Next step:</strong> ${esc(r.nextSteps || '')}</div>
    `;
    list.appendChild(card);
  });
}

function downloadPDF() {
  const resumePreview = document.getElementById('resumePreview');
  const pdf = new jspdf.jsPDF('p', 'pt', 'a4');
  const margin = 20;

  html2canvas(resumePreview, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Additional pages (use negative y to "crop" subsequent parts)
    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('resume.pdf');
  });
}
resp