import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Input from '@/Components/ui/Input';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import Select from '@/Components/ui/Select';
import Modal from '@/Components/ui/Modal';
import { PaginatedData, User } from '@/types/models';
import { Plus, Search, Trash2, Edit2, UserPlus, Mail, Shield, Calendar, MoreVertical } from 'lucide-react';
import { useState, FormEventHandler, useEffect } from 'react';
import clsx from 'clsx';
import Dropdown from '@/Components/Dropdown';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Pagination from '@/Components/ui/Pagination';
import ConfirmModal from '@/Components/ui/ConfirmModal';

interface UsersProps {
    users: PaginatedData<User>;
    filters: {
        search?: string;
    };
}

export default function Users({ users, filters }: UsersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'manager',
    });

    const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                const params = { search };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );
                router.get(route('users.index'), cleanParams, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!isDeletingId) return;
        setIsDeleting(true);
        router.delete(route('users.destroy', isDeletingId), {
            onFinish: () => {
                setIsDeletingId(null);
                setIsDeleting(false);
            },
        });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: ''
        });
        setIsCreateModalOpen(true);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingUser) return;
        
        put(route('users.update', editingUser.id), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setEditingUser(null);
            },
        });
    };

    const getRoleVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin': return 'primary';
            case 'manager': return 'info';
            case 'accountant': return 'success';
            default: return 'soft';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Team Management" />

            <PageHeader 
                title="Users"
                subtitle="Manage team members, roles, and administrative permissions"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<UserPlus className="w-5 h-5" />} 
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Add Team Member
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="w-full">
                    <Input
                        placeholder="Search team members by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>
            </Toolbar>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Member Info</TableHead>
                            <TableHead>Access Role</TableHead>
                            <TableHead>Account Status</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length > 0 ? (
                            users.data.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                                                <div className="text-[11px] text-slate-400 font-medium">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleVariant(user.role)} className="font-medium text-[10px] uppercase tracking-wide">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={user.active ? 'success' : 'danger'} 
                                            className="font-medium text-[10px] uppercase tracking-wide"
                                        >
                                            {user.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[13px] text-slate-600 font-medium">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <TableActions>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all border border-transparent">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium"
                                                    >
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Edit Profile
                                                    </button>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button
                                                        onClick={() => setIsDeletingId(user.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Delete User
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <Shield className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">No team members identified</p>
                                        <p className="text-xs">Access control and user logs will appear here.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Pagination data={users} />

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    reset();
                    setEditingUser(null);
                }}
                title={editingUser ? "Configure User Access" : "Register New Team Member"}
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="soft" onClick={() => {
                            setIsCreateModalOpen(false);
                            reset();
                            setEditingUser(null);
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={editingUser ? submitEdit : submitCreate} 
                            loading={processing}
                            className="min-w-[120px]"
                        >
                            {editingUser ? "Update Profile" : "Create Account"}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="e.g. Alexander Hamilton"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            placeholder="alex@finance.co"
                        />
                    </div>
                    <Select
                        label="System Access Role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        error={errors.role}
                    >
                        <option value="admin">Administrator (Full Access)</option>
                        <option value="manager">Manager (Financial Operations)</option>
                        <option value="accountant">Accountant (View/Report Only)</option>
                    </Select>
                    <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={editingUser ? "Restrictive Password Update" : "Secure Password"}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder={editingUser ? "Leave blank to maintain" : "••••••••"}
                        />
                        <Input
                            label="Verify Security Phrase"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!isDeletingId}
                onClose={() => setIsDeletingId(null)}
                onConfirm={handleDelete}
                title="Deactivate Team Member?"
                message="This will immediately revoke all system access for this member and terminate their active sessions. This action is audited."
                confirmText="Deactivate Member"
                variant="danger"
                loading={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
