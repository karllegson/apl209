'use client'

export function InputField({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="form-field-label block mb-1.5 md:mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5" style={{ color: '#666666' }} />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full intake-input ${Icon ? 'pl-9 md:pl-11' : 'px-3 md:px-4'} pr-3 md:pr-4 py-2 md:py-3 rounded-lg border text-base transition-all`}
          style={{
            borderColor: error ? '#EF4444' : '#CCCCCC',
            backgroundColor: error ? '#FEF2F2' : '#FFFFFF',
            color: '#111827',
          }}
        />
      </div>
      {error && <p className="text-red-500 text-xs md:text-sm mt-1 md:mt-1.5">{error}</p>}
    </div>
  )
}

export function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="form-field-label block mb-1.5 md:mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border text-base transition-all appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs md:text-sm mt-1 md:mt-1.5">{error}</p>}
    </div>
  )
}

export function RadioGroup({ label, required, options, value, onChange, error }) {
  return (
    <div>
      {label && (
        <label className="form-field-label block mb-2 md:mb-3 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg border text-sm md:text-base font-medium transition-all cursor-pointer ${
              value === opt.value
                ? 'bg-apl-primary text-white border-apl-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs md:text-sm mt-1 md:mt-1.5">{error}</p>}
    </div>
  )
}

export function YesNoButtons({ label, required, value, onChange, error, options }) {
  const opts = options || [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ]
  return (
    <div>
      {label && (
        <label className="form-field-label block mb-2 md:mb-3 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        {opts.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg border text-sm md:text-base font-medium transition-all cursor-pointer ${
              value === opt.value
                ? 'bg-apl-primary text-white border-apl-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs md:text-sm mt-1 md:mt-1.5">{error}</p>}
    </div>
  )
}

export function CheckboxGroup({ label, options, values, onChange }) {
  const toggle = (val) => {
    const next = values.includes(val)
      ? values.filter((v) => v !== val)
      : [...values, val]
    onChange(next)
  }
  return (
    <div>
      {label && (
        <label className="form-field-label block mb-2 md:mb-3 text-gray-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border text-sm md:text-base font-medium transition-all cursor-pointer ${
              values.includes(opt.value)
                ? 'bg-apl-primary text-white border-apl-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SectionTitle({ children }) {
  return (
    <h3 className="form-section-heading">
      {children}
    </h3>
  )
}
