'use server';
import { validate } from 'uuid';
import { users } from '../../../migrations/schema';
import db from './db';
import { Subscription, User, Workspace, Page } from './supabase.types';
import { and, eq, ilike, notExists, inArray } from 'drizzle-orm';
import { collaborators, pages, workspaces } from './schema';
import { revalidatePath } from 'next/cache';

// GET DATA

export const getUserSubscriptionStatus = async (userId: string) => {
    try {
        const data = await db.query.subscriptions.findFirst({
            where: (s, { eq }) => eq(s.userId, userId),
        });
        if (data) return { data: data as Subscription, error: null };
        else return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: `Error` };
    }
};

export const getPages = async (workspaceId: string) => {
    const isValid = validate(workspaceId);
    if (!isValid) {
        console.log('🔴 getPages: INVALID UUID', workspaceId);
        return {
            data: null,
            error: 'Error',
        };
    }

    try {
        const results: Page[] | [] = await db
            .select()
            .from(pages)
            .orderBy(pages.createdAt)
            .where(eq(pages.workspaceId, workspaceId));
        console.log('🟢 getPages success:', results.length);
        return { data: results, error: null };
    } catch (error) {
        console.log('🔴 getPages error:', error);
        return { data: null, error: 'Error' };
    }
};

export const getWorkspaceDetails = async (workspaceId: string) => {
    const isValid = validate(workspaceId);
    if (!isValid) {
        console.log('🔴 getWorkspaceDetails: INVALID UUID', workspaceId);
        return {
            data: [],
            error: 'Error',
        };
    }

    try {
        const response = (await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))
            .limit(1)) as Workspace[];
        console.log('🟢 getWorkspaceDetails success:', response);
        return { data: response, error: null };
    } catch (error) {
        console.log('🔴 getWorkspaceDetails error:', error);
        return { data: [], error: 'Error' };
    }
};

export const getPageDetails = async (pageId: string) => {
    const isValid = validate(pageId);
    if (!isValid) {
        data: [];
        error: 'Error';
    }
    try {
        const response = (await db
            .select()
            .from(pages)
            .where(eq(pages.id, pageId))
            .limit(1)) as Page[];
        return { data: response, error: null };
    } catch (error) {
        console.log('🔴Error', error);
        return { data: [], error: 'Error' };
    }
};

export const getPrivateWorkspaces = async (userId: string) => {
    if (!userId) return [];
    const privateWorkspaces = (await db
        .select({
            id: workspaces.id,
            createdAt: workspaces.createdAt,
            workspaceOwner: workspaces.workspaceOwner,
            title: workspaces.title,
            novelData: workspaces.novelData,
            blocknoteData: workspaces.blocknoteData,
            quillData: workspaces.quillData,
            inTrash: workspaces.inTrash,
            bannerUrl: workspaces.bannerUrl,
        })
        .from(workspaces)
        .where(
            and(
                notExists(
                    db
                        .select()
                        .from(collaborators)
                        .where(eq(collaborators.workspaceId, workspaces.id))
                ),
                eq(workspaces.workspaceOwner, userId)
            )
        )) as Workspace[];
    return privateWorkspaces;
};

export const getCollaboratingWorkspaces = async (userId: string) => {
    if (!userId) return [];
    const collaboratedWorkspaces = (await db
        .select({
            id: workspaces.id,
            createdAt: workspaces.createdAt,
            workspaceOwner: workspaces.workspaceOwner,
            title: workspaces.title,
            novelData: workspaces.novelData,
            blocknoteData: workspaces.blocknoteData,
            quillData: workspaces.quillData,
            inTrash: workspaces.inTrash,
            bannerUrl: workspaces.bannerUrl,
        })
        .from(users)
        .innerJoin(collaborators, eq(users.id, collaborators.userId))
        .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
        .where(eq(users.id, userId))) as Workspace[];
    return collaboratedWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
    if (!userId) return [];
    const sharedWorkspaces = (await db
        .selectDistinct({
            id: workspaces.id,
            createdAt: workspaces.createdAt,
            workspaceOwner: workspaces.workspaceOwner,
            title: workspaces.title,
            novelData: workspaces.novelData,
            blocknoteData: workspaces.blocknoteData,
            quillData: workspaces.quillData,
            inTrash: workspaces.inTrash,
            bannerUrl: workspaces.bannerUrl,
        })
        .from(workspaces)
        .orderBy(workspaces.createdAt)
        .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
        .where(eq(workspaces.workspaceOwner, userId))) as Workspace[];
    return sharedWorkspaces;
};



export const getActiveProductsWithPrice = async () => {
    try {
        const res = await db.query.products.findMany({
            where: (pro, { eq }) => eq(pro.active, true),

            with: {
                prices: {
                    where: (pri: { active: any }) => eq(pri.active, true),
                },
            },
        });
        if (res.length) return { data: res, error: null };
        return { data: [], error: null };
    } catch (error) {
        console.log(error);
        return { data: [], error };
    }
};

export const getCollaborators = async (workspaceId: string) => {
    const response = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.workspaceId, workspaceId));
    if (!response.length) return [];
    const userInformation: Promise<User | undefined>[] = response.map(
        async (user) => {
            const exists = await db.query.users.findFirst({
                where: (u, { eq }) => eq(u.id, user.userId),
            });
            return exists;
        }
    );
    const resolvedUsers = await Promise.all(userInformation);
    return resolvedUsers.filter(Boolean) as User[];
};

export const getUsersFromSearch = async (email: string) => {
    if (!email) return [];
    const accounts = db
        .select()
        .from(users)
        .where(ilike(users.email, `${email}%`));
    return accounts;
};

export const findUser = async (userId: string) => {
    const response = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
    });
    return response;
};

// ADD DATA

export const addCollaborators = async (users: User[], workspaceId: string) => {
    const response = users.forEach(async (user: User) => {
        const userExists = await db.query.collaborators.findFirst({
            where: (u, { eq }) =>
                and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
        });
        if (!userExists)
            await db.insert(collaborators).values({ workspaceId, userId: user.id });
    });
};

// REMOVE DATA

export const deleteWorkspace = async (workspaceId: string) => {
    if (!workspaceId) return;
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};

export const deletePage = async (pageId: string) => {
    if (!pageId) return;
    await db.delete(pages).where(eq(pages.id, pageId));
};

export const removeCollaborators = async (
    users: User[],
    workspaceId: string
) => {
    const response = users.forEach(async (user: User) => {
        const userExists = await db.query.collaborators.findFirst({
            where: (u, { eq }) =>
                and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
        });
        if (userExists)
            await db
                .delete(collaborators)
                .where(
                    and(
                        eq(collaborators.workspaceId, workspaceId),
                        eq(collaborators.userId, user.id)
                    )
                );
    });
};

// CREATING NEW DATA

export const createWorkspace = async (workspace: Workspace) => {
    try {
        const response = await db.insert(workspaces).values(workspace);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const createPage = async (page: Page) => {
    try {
        await db.insert(pages).values(page);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

// UPDATE DATA

export const updatePage = async (page: Partial<Page>, pageId: string) => {
    try {
        const response = await db
            .update(pages)
            .set(page)
            .where(eq(pages.id, pageId));

        if ('inTrash' in page) {
            const getDescendantPageIds = async (id: string): Promise<string[]> => {
                const children = await db.select().from(pages).where(eq(pages.parentId, id));
                let ids = children.map(c => c.id);
                for (const child of children) {
                    const subIds = await getDescendantPageIds(child.id);
                    ids = [...ids, ...subIds];
                }
                return ids;
            };

            const descendantIds = await getDescendantPageIds(pageId);
            if (descendantIds.length > 0) {
                await db
                    .update(pages)
                    .set({ inTrash: page.inTrash })
                    .where(inArray(pages.id, descendantIds));
            }
        }

        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const updateUser = async (user: Partial<User>, userId: string) => {
    try {
        await db.update(users).set(user).where(eq(users.id, userId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const updateWorkspace = async (
    workspace: Partial<Workspace>,
    workspaceId: string
) => {
    if (!workspaceId) return;
    try {
        await db
            .update(workspaces)
            .set(workspace)
            .where(eq(workspaces.id, workspaceId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};
