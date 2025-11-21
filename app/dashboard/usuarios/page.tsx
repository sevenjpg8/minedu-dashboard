"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("Especialista")

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()))

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setRole("Especialista")
    setCurrentUser(null)
  }

    const formatDate = (iso?: string | null) => {
        if (!iso) return "-"
        try {
            return new Date(iso).toLocaleString("es-PE", {
            timeZone: "America/Lima",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            })
        } catch {
            return iso
        }
    }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        const rol_id = role === "Administrador" ? 1 : 2;
        const rol = role === "Administrador" ? "admin" : "especialista";

        const res = await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                rol_id,
                rol,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
        toast.error(data.error || "Error creando usuario");
        return;
        }

        toast.success("Usuario creado exitosamente");

        // Recargar usuarios desde el backend
        const refresh = await fetch("/api/usuarios");
        const updated = await refresh.json();

        const formatted = updated.map((u: any) => ({
            id: u.id,
            email: u.email,
            role: u.rol === "admin" ? "Administrador" : "Especialista",
        }));

        setUsers(formatted);

        setIsAddDialogOpen(false);
        resetForm();
    } catch (error) {
        console.error("Error creando usuario:", error);
        toast.error("Error al crear usuario");
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
        const rol_id = role === "Administrador" ? 1 : 2;
        const rol = role === "Administrador" ? "admin" : "especialista";

        const res = await fetch("/api/usuarios", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: currentUser.id,
                email,
                rol_id,
                rol,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Error actualizando usuario");
            return;
        }

        toast.success("Usuario actualizado exitosamente");

        const refresh = await fetch("/api/usuarios");
        const updated = await refresh.json();

        const formatted = updated.map((u: any) => ({
            id: u.id,
            email: u.email,
            role: u.rol === "admin" ? "Administrador" : "Especialista",
            updated_at: u.updated_at,
            created_at: u.created_at,
        }));

        setUsers(formatted);

        setIsEditDialogOpen(false);
        resetForm();

    } catch (error) {
        console.error("Error editando usuario:", error);
        toast.error("Error al editar usuario");
    }
  }

  const openEditDialog = (user: any) => {
    setCurrentUser(user)
    setEmail(user.email)
    setRole(user.role)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = async(id: number) => {
    try {
        const res = await fetch("/api/usuarios", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (!res.ok) {
        toast.error(data.error || "Error eliminando usuario");
        return;
        }

        toast.success("Usuario eliminado correctamente");

        // Recargar lista desde backend
        const refresh = await fetch("/api/usuarios");
        const updated = await refresh.json();

        const formatted = updated.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.rol === "admin" ? "Administrador" : "Especialista",
        }));

        setUsers(formatted);
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        toast.error("Error al eliminar usuario");
    }
  }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/usuarios");
                const data = await res.json();
                const formatted = data.map((u: any) => ({
                    id: u.id,
                    email: u.email,
                    role: u.rol === "admin" ? "Administrador" : "Especialista",
                }));

                setUsers(formatted);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Error al cargar los usuarios");
            }
        };

        fetchUsers();
    }, []);


  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los accesos y roles del sistema.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
                <Plus size={20} />
                Crear Nuevo Usuario
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo usuario. Se enviará un correo de confirmación.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@minedu.gob.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Guardar Usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Lista de todos los usuarios con acceso al sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por correo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                            variant={user.role === "Administrador" ? "default" : "secondary"}
                            className={user.role === "Administrador" ? "bg-blue-900 hover:bg-blue-800" : ""}
                        >
                            {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Correo Electrónico</Label>
                <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Especialista">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
