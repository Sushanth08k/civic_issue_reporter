function FeatureHighlights() {
  const features = [
    {
      title: 'Smart Image Classification',
      description: 'Upload any civic issue photo and let the AI identify the problem type instantly.',
      icon: '🧠',
    },
    {
      title: 'Auto Complaint Letter',
      description: 'Generate a polished complaint letter automatically based on the issue and location.',
      icon: '✉️',
    },
    {
      title: 'Track Every Report',
      description: 'Monitor submission status and keep your community informed through a dedicated dashboard.',
      icon: '📈',
    },
  ];

  return (
    <section className="feature-highlights">
      {features.map((feature) => (
        <article key={feature.title} className="feature-card">
          <div className="feature-icon">{feature.icon}</div>
          <div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default FeatureHighlights;
