import { useState, useEffect, useCallback } from 'react'
import { configApi } from '../../../api/configApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, FormField } from '../../../components/FormField/FormField'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { toast } from '../../../components/Toast/Toast'
import type { ConfigResponse } from '../../../types/config'

export function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await configApi.getAll()
      const list = res.data || []
      setConfigs(list)
      const vals: Record<string, string> = {}
      list.forEach(c => { vals[c.tenThamSo] = c.giaTri })
      setEditValues(vals)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách tham số'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConfigs() }, [fetchConfigs])

  const handleSave = async (key: string) => {
    try {
      await configApi.updateConfig(key, { giaTri: editValues[key] })
      toast.success(`Cập nhật ${key} thành công`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Cập nhật thất bại'))
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await configApi.batchUpdate({ thamSo: editValues })
      toast.success('Cập nhật tất cả thành công')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Cập nhật thất bại'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState text="Đang tải tham số hệ thống..." />
  if (error) return <ErrorState message={error} onRetry={fetchConfigs} />

  return (
    <div className="config-page">
      <div className="page-header">
        <h1>Quản lý tham số hệ thống</h1>
        <Button onClick={handleSaveAll} isLoading={saving}>Lưu tất cả</Button>
      </div>

      <div className="config-list">
        {configs.map(c => (
          <div key={c.tenThamSo} className="config-item">
            <div className="config-info">
              <div className="config-key">{c.tenThamSo}</div>
              <div className="config-desc">{c.moTa}</div>
            </div>
            <div className="config-edit">
              <FormField label="">
                <Input
                  value={editValues[c.tenThamSo] ?? ''}
                  onChange={v => setEditValues(p => ({ ...p, [c.tenThamSo]: v }))}
                />
              </FormField>
              <Button size="sm" onClick={() => handleSave(c.tenThamSo)}>Lưu</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
