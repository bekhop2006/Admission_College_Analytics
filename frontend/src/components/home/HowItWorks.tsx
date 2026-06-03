/** Three-step guide shown on the landing page. */
export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Укажите балл ЕНТ',
      text: 'Введите свой результат от 0 до 140 — мы сравним его с пороговыми значениями НЦТ.',
    },
    {
      number: '02',
      title: 'Выберите комбинацию предметов',
      text: 'Пара профильных предметов определяет, на какие специальности вы можете претендовать.',
    },
    {
      number: '03',
      title: 'Получите список вузов',
      text: 'Смотрите подходящие учреждения, минимальные баллы и программы по каждому вузу.',
    },
  ]

  return (
    <section className="home-steps">
      <h2 className="home-section-title">Как это работает</h2>
      <div className="home-steps-grid">
        {steps.map((step) => (
          <article key={step.number} className="home-step-card">
            <span className="home-step-number">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
