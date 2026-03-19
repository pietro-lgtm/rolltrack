import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function AcademyCreate() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [description, setDescription] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [hasOpenMat, setHasOpenMat] = useState(false)
  const [allowsDropIns, setAllowsDropIns] = useState(false)
  const [dropInPrice, setDropInPrice] = useState('')

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      // Get user location for lat/lng
      let lat = 0, lng = 0
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        )
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {}

      const result = await api.post<any>('/academies', {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        phone: phone.trim() || null,
        website: website.trim() || null,
        instagram: instagram.trim() || null,
        description: description.trim(),
        affiliation: affiliation.trim() || null,
        hasOpenMat,
        allowsDropIns,
        dropInPrice: dropInPrice ? parseFloat(dropInPrice) : null,
        lat,
        lng,
      })
      navigate(`/map/academy/${result.id}`)
    } catch (err) {
      console.error('Failed to create academy', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-white">Add Academy</h1>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-24 space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Academy name"
            className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Affiliation</label>
          <input
            type="text"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            placeholder="e.g. Gracie Barra, Alliance, Atos"
            className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="About this academy..."
            className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50 resize-none h-20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Instagram</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50" />
        </div>

        {/* Toggles */}
        <div className="flex gap-3">
          <button
            onClick={() => setHasOpenMat(!hasOpenMat)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              hasOpenMat ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50' : 'bg-navy-800 text-gray-500'
            }`}
          >
            Open Mat
          </button>
          <button
            onClick={() => setAllowsDropIns(!allowsDropIns)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              allowsDropIns ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'bg-navy-800 text-gray-500'
            }`}
          >
            Drop-Ins
          </button>
        </div>

        {allowsDropIns && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Drop-In Price ($)</label>
            <input
              type="number"
              value={dropInPrice}
              onChange={(e) => setDropInPrice(e.target.value)}
              placeholder="25"
              className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-4 rounded-xl bg-blue-500 text-white text-base font-bold hover:bg-blue-400 transition-colors active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Creating...' : 'Create Academy'}
        </button>
      </div>
    </div>
  )
}
