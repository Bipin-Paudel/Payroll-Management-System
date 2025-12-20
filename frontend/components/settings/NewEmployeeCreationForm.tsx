"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

import { api } from "@/lib/api"
import DepartmentCreateForm from "@/components/settings/DepartmentCreateForm"
import RoleCreateForm from "@/components/settings/RoleCreateForm"
import { NepaliDateInput } from "@/components/ui/nepali-date-input"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Dept = { id: string; name: string }
type Role = { id: string; name: string }

type Props = {
  onClose?: () => void
  onCreated?: () => void | Promise<void>
}

export default function NewEmployeeCreationForm({ onClose, onCreated }: Props) {
  const router = useRouter()

  const [employeeName, setEmployeeName] = React.useState("")
  const [panNo, setPanNo] = React.useState("")

  const [departmentId, setDepartmentId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")

  const [gender, setGender] = React.useState("")
  const [disability, setDisability] = React.useState(false)

  const [joiningAd, setJoiningAd] = React.useState("")
  const [joiningBs, setJoiningBs] = React.useState("")

  const [lifeInsurance, setLifeInsurance] = React.useState<string>("0")
  const [healthInsurance, setHealthInsurance] = React.useState<string>("0")
  const [houseInsurance, setHouseInsurance] = React.useState<string>("0")

  const totalInsurance =
    (Number(lifeInsurance) || 0) +
    (Number(healthInsurance) || 0) +
    (Number(houseInsurance) || 0)

  const [departments, setDepartments] = React.useState<Dept[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [loadingMeta, setLoadingMeta] = React.useState(true)

  const [deptOpen, setDeptOpen] = React.useState(false)
  const [roleOpen, setRoleOpen] = React.useState(false)

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const [serverMsg, setServerMsg] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Auto-hide message after 6 seconds
  React.useEffect(() => {
    if (!serverMsg) return
    const t = setTimeout(() => setServerMsg(null), 6000)
    return () => clearTimeout(t)
  }, [serverMsg])

  async function fetchMeta() {
    setLoadingMeta(true)
    try {
      const [dRes, rRes] = await Promise.all([
        api.get("/departments"),
        api.get("/roles"),
      ])

      setDepartments(Array.isArray(dRes.data) ? dRes.data : dRes.data?.data ?? [])
      setRoles(Array.isArray(rRes.data) ? rRes.data : rRes.data?.data ?? [])
    } catch {
      // Keep UI stable even if meta fetch fails
    } finally {
      setLoadingMeta(false)
    }
  }

  React.useEffect(() => {
    fetchMeta()
  }, [])

  function validate() {
    const e: Record<string, string> = {}

    if (!employeeName.trim()) e.employeeName = "Employee name is required."
    if (!departmentId) e.departmentId = "Department is required."
    if (!roleId) e.roleId = "Role is required."
    if (!gender) e.gender = "Gender is required."
    if (!joiningBs) e.joiningBs = "Date of joining is required."

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setServerMsg(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      await api.post("/employees", {
        name: employeeName.trim(),
        panNo: panNo.trim() || null,
        departmentId,
        roleId,
        gender,
        disability,
        dateOfJoiningAd: joiningAd || null,
        dateOfJoiningBs: joiningBs || null,
        lifeInsurance: Number(lifeInsurance) || 0,
        healthInsurance: Number(healthInsurance) || 0,
        houseInsurance: Number(houseInsurance) || 0,
      })

      setServerMsg({ type: "success", text: "Employee created successfully." })

      // reset
      setEmployeeName("")
      setPanNo("")
      setDepartmentId("")
      setRoleId("")
      setGender("")
      setDisability(false)
      setJoiningAd("")
      setJoiningBs("")
      setLifeInsurance("0")
      setHealthInsurance("0")
      setHouseInsurance("0")

      if (onCreated) await onCreated()
    } catch (e: any) {
      setServerMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to create employee.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onClose) return onClose()
    router.back()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Create Employee
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Add a new employee record. Departments and roles are company-specific.
          </p>
        </div>
      </div>

      <div className="form-card w-full">
        <form onSubmit={onSubmit}>
          <div className="p-6 md:p-10">
            {/* Section: Employee Details */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Employee Details</h2>
              <p className="mt-1 text-sm text-gray-600">
                Fill in the employee’s basic information and joining date.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Employee Name */}
              <div>
                <label className="form-label">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-3">
                  <input
                    className="form-input"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                  {errors.employeeName && (
                    <p className="mt-2 text-sm text-red-600">{errors.employeeName}</p>
                  )}
                </div>
              </div>

              {/* PAN */}
              <div>
                <label className="form-label">PAN No.</label>
                <div className="mt-3">
                  <input
                    className="form-input"
                    value={panNo}
                    onChange={(e) => setPanNo(e.target.value)}
                    placeholder="Optional (stored as text)"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter exactly as issued (no formatting required).
                  </p>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="form-label">
                  Department <span className="text-red-500">*</span>
                </label>

                <div className="mt-3 flex items-center gap-3">
                  <select
                    className="form-select"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={loadingMeta}
                  >
                    <option value="">
                      {loadingMeta ? "Loading..." : "Select department"}
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="form-button-outline shrink-0"
                    onClick={() => setDeptOpen(true)}
                  >
                    + Add
                  </button>
                </div>

                {errors.departmentId && (
                  <p className="mt-2 text-sm text-red-600">{errors.departmentId}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="form-label">
                  Role <span className="text-red-500">*</span>
                </label>

                <div className="mt-3 flex items-center gap-3">
                  <select
                    className="form-select"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={loadingMeta}
                  >
                    <option value="">
                      {loadingMeta ? "Loading..." : "Select role"}
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="form-button-outline shrink-0"
                    onClick={() => setRoleOpen(true)}
                  >
                    + Add
                  </button>
                </div>

                {errors.roleId && (
                  <p className="mt-2 text-sm text-red-600">{errors.roleId}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="form-label">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="mt-3">
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>

                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Date of Joining */}
              <div>
                <label className="form-label">
                  Date of Joining <span className="text-red-500">*</span>
                </label>
                <div className="mt-3">
                  <NepaliDateInput
                    valueAd={joiningAd}
                    valueBs={joiningBs}
                    placeholder="Select date"
                    className="w-full"
                    onChangeAd={(ad, bs) => {
                      setJoiningAd(ad)
                      setJoiningBs(bs || "")
                    }}
                  />

                  {errors.joiningBs && (
                    <p className="mt-2 text-sm text-red-600">{errors.joiningBs}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Uses Nepali date from the picker (BS) and stores AD if available.
                  </p>
                </div>
              </div>

              {/* Disability */}
              <div className="md:col-span-2">
                <div className="mt-1 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Disability</p>
                    <p className="text-xs text-gray-600">
                      Enable this if the employee qualifies for disability status.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={disability}
                      onChange={(e) => setDisability(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    Enabled
                  </label>
                </div>
              </div>
            </div>

            {/* Section: Insurance */}
            <div className="mt-10">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Insurance & Benefits</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter monthly insurance amounts (if applicable).
                  </p>
                </div>

                <div className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                  Total: <span className="ml-1">{totalInsurance}</span>
                </div>
              </div>

              <div className="form-card p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="form-label">Life Insurance Amount</label>
                    <div className="mt-3">
                      <input
                        className="form-input"
                        value={lifeInsurance}
                        onChange={(e) => setLifeInsurance(e.target.value)}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Health Insurance Amount</label>
                    <div className="mt-3">
                      <input
                        className="form-input"
                        value={healthInsurance}
                        onChange={(e) => setHealthInsurance(e.target.value)}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">House Insurance Amount</label>
                    <div className="mt-3">
                      <input
                        className="form-input"
                        value={houseInsurance}
                        onChange={(e) => setHouseInsurance(e.target.value)}
                        inputMode="numeric"
                        type="number"
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900">Total Insurance</div>
                  <div className="text-sm font-bold text-gray-900">{totalInsurance}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="form-button-outline w-full sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="form-button-primary w-full sm:w-auto"
              >
                {submitting ? "Creating..." : "Create Employee"}
              </button>
            </div>

            {/* Success / error below form */}
            {serverMsg && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  serverMsg.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {serverMsg.text}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Department Dialog */}
      <Dialog
        open={deptOpen}
        onOpenChange={(open) => {
          setDeptOpen(open)
          if (!open) fetchMeta()
        }}
      >
        <DialogContent className="w-[94vw] sm:w-[50vw] max-w-none sm:max-w-none rounded-2xl p-8">
          <DialogHeader>
            <VisuallyHidden.Root>
              <DialogTitle>Create Department</DialogTitle>
            </VisuallyHidden.Root>
          </DialogHeader>

          <DepartmentCreateForm
            // @ts-ignore
            onSuccess={() => {
              fetchMeta()
              setDeptOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog
        open={roleOpen}
        onOpenChange={(open) => {
          setRoleOpen(open)
          if (!open) fetchMeta()
        }}
      >
        <DialogContent className="w-[94vw] sm:w-[50vw] max-w-none sm:max-w-none rounded-2xl p-8">
          <DialogHeader>
            <VisuallyHidden.Root>
              <DialogTitle>Create Role</DialogTitle>
            </VisuallyHidden.Root>
          </DialogHeader>

          <RoleCreateForm
            // @ts-ignore
            onSuccess={() => {
              fetchMeta()
              setRoleOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
