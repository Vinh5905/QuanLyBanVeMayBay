import './StepIndicator.css'

interface Step {
  label: string
  description: string
}

interface Props {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step-item ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
        >
          <div className="step-number">
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div className="step-info">
            <div className="step-label">{step.label}</div>
            <div className="step-desc">{step.description}</div>
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  )
}
