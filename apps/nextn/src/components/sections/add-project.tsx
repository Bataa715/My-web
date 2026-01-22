'use client';

import { useState } from 'react';
import { PlusCircle, X, Search, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectContext';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import TechIcon from '../shared/TechIcon';
import { Badge } from '../ui/badge';
import Image from 'next/image';

// Popular technologies list for quick selection
const popularTechnologies = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Node.js',
  'Firebase',
  'PostgreSQL',
  'MongoDB',
  'Tailwind CSS',
  'Vue',
  'Angular',
  'React Native',
  'Flutter',
  'Docker',
  'AWS',
  'Supabase',
  'GraphQL',
  'Express',
  'NestJS',
  'Django',
  'FastAPI',
  'Prisma',
  'Redis',
  'Vercel',
  'Netlify',
  'GitHub',
  'Git',
  'Figma',
  'Framer',
  'Vite',
  'Jest',
  'Cypress',
  'Stripe',
  'Electron',
  'Tauri',
  'Kubernetes',
  'Terraform',
  'MySQL',
  'SQLite',
  'MinIO',
  'Expo',
];

const projectSchema = z.object({
  name: z.string().min(2, 'Төслийн нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  description: z
    .string()
    .min(10, 'Төслийн тайлбар дор хаяж 10 тэмдэгттэй байх ёстой.'),
  technologies: z
    .array(z.string())
    .min(1, 'Дор хаяж нэг технологи сонгох ёстой.'),
  link: z
    .string()
    .url('Github холбоос буруу байна.')
    .optional()
    .or(z.literal('')),
  live: z
    .string()
    .url('Live хувилбарын холбоос буруу байна.')
    .optional()
    .or(z.literal('')),
  category: z.string().min(1, 'Төслийн ангилал заавал байх ёстой.'),
  image: z.string().optional().or(z.literal('')),
});

interface AddProjectProps {
  setDialogOpen?: (isOpen: boolean) => void;
}

export default function AddProject({ setDialogOpen }: AddProjectProps) {
  const { addProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [customTech, setCustomTech] = useState('');

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      technologies: [],
      link: '',
      live: '',
      category: '',
      image: '',
    },
  });

  const imageValue = form.watch('image');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    await addProject(values);
    form.reset();
    setDialogOpen?.(false);
  }

  const selectedTechs = form.watch('technologies') || [];

  const handleTechToggle = (techName: string) => {
    const currentTechs = form.getValues('technologies') || [];
    const newTechs = currentTechs.includes(techName)
      ? currentTechs.filter(t => t !== techName)
      : [...currentTechs, techName];
    form.setValue('technologies', newTechs, { shouldValidate: true });
  };

  const handleAddCustomTech = () => {
    if (customTech.trim() && !selectedTechs.includes(customTech.trim())) {
      const newTechs = [...selectedTechs, customTech.trim()];
      form.setValue('technologies', newTechs, { shouldValidate: true });
      setCustomTech('');
    }
  };

  const handleRemoveTech = (techName: string) => {
    const newTechs = selectedTechs.filter(t => t !== techName);
    form.setValue('technologies', newTechs, { shouldValidate: true });
  };

  const filteredTechnologies = popularTechnologies.filter(tech =>
    tech.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Төслийн нэр</FormLabel>
              <FormControl>
                <Input placeholder="Жишээ нь: Хувийн блог" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тайлбар</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Төслийнхөө талаар товч тайлбар бичнэ үү..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Зураг</FormLabel>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-md border bg-muted flex items-center justify-center shrink-0">
                  {imageValue ? (
                    <Image
                      src={imageValue}
                      alt="Project preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="w-full space-y-2">
                  <Input
                    placeholder="Зургийн холбоос..."
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Компьютерээс сонгох
                    </Button>
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technologies"
          render={() => (
            <FormItem>
              <FormLabel>Ашигласан технологиуд</FormLabel>

              {selectedTechs.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {selectedTechs.map(tech => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="flex items-center gap-1.5 pr-1 bg-primary/20 text-primary border border-primary/30"
                    >
                      <TechIcon techName={tech} className="h-5 w-5" />
                      <span className="text-xs">{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-1 p-0.5 rounded-full hover:bg-primary/30 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pb-2">
                <Input
                  placeholder="Өөр технологи нэмэх..."
                  value={customTech}
                  onChange={e => setCustomTech(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTech();
                    }
                  }}
                  className="flex-1 h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomTech}
                  disabled={!customTech.trim()}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative pb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Технологи хайх..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <ScrollArea className="h-40 w-full rounded-md border p-3">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {filteredTechnologies.map(tech => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => handleTechToggle(tech)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-200',
                        selectedTechs.includes(tech)
                          ? 'bg-primary/20 border-primary shadow-md shadow-primary/20 scale-105'
                          : 'bg-muted/30 border-transparent hover:bg-muted hover:border-muted-foreground/30'
                      )}
                    >
                      <TechIcon techName={tech} className="h-8 w-8" />
                      <span className="text-[10px] text-center font-medium truncate w-full">
                        {tech}
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ангилал</FormLabel>
              <FormControl>
                <Input placeholder="Жишээ нь: Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github холбоос</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/user/repo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="live"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Live хувилбарын холбоос</FormLabel>
              <FormControl>
                <Input placeholder="https://my-project.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            'Нэмж байна...'
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" /> Төсөл нэмэх
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
