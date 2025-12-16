import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Input from '@/Components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Select from '@/Components/ui/Select';
import Modal from '@/Components/ui/Modal';
import { PaginatedData, User } from '@/types/models';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

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
    
    // Form for creating/editing user
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'manager',
    });

    const handleSearch = (term: string) => {
        setSearch(term);
        router.get(route('users.index'), { search: term }, { preserveState: true, replace: true });
    };

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', id));
        }
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        User Management
                    </h2>
                    <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => setIsCreateModalOpen(true)}>
                        Add User
                    </Button>
                </div>
            }
        >
            <Head title="Users" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.active ? 'success' : 'danger'} status={user.active ? 'active' : 'inactive'}>
                                                        {user.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            className="text-gray-400 hover:text-gray-600"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            className="text-red-400 hover:text-red-600"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    reset();
                    setEditingUser(null);
                }}
                title={editingUser ? "Edit User" : "Add New User"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => {
                            setIsCreateModalOpen(false);
                            reset();
                            setEditingUser(null);
                        }}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={editingUser ? submitEdit : submitCreate} loading={processing}>
                            {editingUser ? "Save Changes" : "Create User"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="john@example.com"
                    />
                    <Select
                        label="Role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        error={errors.role}
                        options={[
                            { label: 'Admin', value: 'admin' },
                            { label: 'Manager', value: 'manager' },
                            { label: 'Accountant', value: 'accountant' },
                        ]}
                    />
                    <div className="pt-2 border-t border-gray-100">
                        <Input
                            label={editingUser ? "New Password (leave blank to keep)" : "Password"}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                        />
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
