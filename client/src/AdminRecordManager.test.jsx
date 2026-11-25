import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import AdminRecordManager from './AdminRecordManager'
import * as api from './api'

vi.mock('./api', () => ({
  apiRequest: vi.fn(),
}))

const sampleRecords = [
  {
    _id: 'rec-1',
    title: 'Intel Encore AI Exhibit',
    completionDate: '2026-05-15T00:00:00.000Z',
    description: 'Interactive spatial installation',
  },
]

describe('AdminRecordManager behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('submits a new record, calls onRecordsChange, resets the form, and displays status feedback', async () => {
    const user = userEvent.setup()
    const onRecordsChange = vi.fn()
    const createdRecord = {
      _id: 'rec-2',
      title: 'Full-Stack Portfolio',
      completionDate: '2026-11-25',
      description: 'Deployed MERN application',
    }
    api.apiRequest.mockResolvedValueOnce(createdRecord)

    render(
      <AdminRecordManager
        collection="projects"
        records={sampleRecords}
        token="test-jwt-token"
        onRecordsChange={onRecordsChange}
      />
    )

    await user.type(screen.getByLabelText(/Title/i), 'Full-Stack Portfolio')
    await user.type(screen.getByLabelText(/Completion date/i), '2026-11-25')
    await user.type(screen.getByLabelText(/Description/i), 'Deployed MERN application')
    await user.click(screen.getByRole('button', { name: /Add project/i }))

    expect(api.apiRequest).toHaveBeenCalledWith('/projects', {
      token: 'test-jwt-token',
      method: 'POST',
      body: JSON.stringify({
        title: 'Full-Stack Portfolio',
        completionDate: '2026-11-25',
        description: 'Deployed MERN application',
      }),
    })
    expect(onRecordsChange).toHaveBeenCalledWith([...sampleRecords, createdRecord])
    expect(screen.getByRole('status')).toHaveTextContent('Record added.')
    expect(screen.getByLabelText(/Title/i)).toHaveValue('')
  })

  it('populates the form when Edit is clicked and resets when Cancel edit is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AdminRecordManager
        collection="projects"
        records={sampleRecords}
        token="test-jwt-token"
        onRecordsChange={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /^Edit$/i }))

    expect(screen.getByLabelText(/Title/i)).toHaveValue('Intel Encore AI Exhibit')
    expect(screen.getByLabelText(/Completion date/i)).toHaveValue('2026-05-15')
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Cancel edit/i }))

    expect(screen.getByLabelText(/Title/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /Add project/i })).toBeInTheDocument()
  })

  it('deletes a record only after user confirmation', async () => {
    const user = userEvent.setup()
    const onRecordsChange = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    api.apiRequest.mockResolvedValueOnce({})

    render(
      <AdminRecordManager
        collection="projects"
        records={sampleRecords}
        token="test-jwt-token"
        onRecordsChange={onRecordsChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /^Delete$/i }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(api.apiRequest).toHaveBeenCalledWith('/projects/rec-1', {
      token: 'test-jwt-token',
      method: 'DELETE',
    })
    expect(onRecordsChange).toHaveBeenCalledWith([])
    expect(screen.getByRole('status')).toHaveTextContent('Record deleted.')
  })

  it('displays an alert message when the API request fails', async () => {
    const user = userEvent.setup()
    api.apiRequest.mockRejectedValueOnce(new Error('Unauthorized request'))

    render(
      <AdminRecordManager
        collection="projects"
        records={[]}
        token="bad-token"
        onRecordsChange={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText(/Title/i), 'Test Item')
    await user.type(screen.getByLabelText(/Completion date/i), '2026-11-25')
    await user.type(screen.getByLabelText(/Description/i), 'Testing error banner')
    await user.click(screen.getByRole('button', { name: /Add project/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unauthorized request')
  })
})