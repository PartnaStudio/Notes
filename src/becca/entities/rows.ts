// FIXME: Booleans should probably be numbers instead (as SQLite does not have booleans.);

export interface AttachmentRow {
    attachmentId?: string;
    ownerId: string;
    role: string;
    mime: string;
    title?: string;
    position?: number;
    blobId: string;
    isProtected?: boolean;
    dateModified?: string;
    utcDateModified?: string;
    utcDateScheduledForErasureSince?: string;
    contentLength?: number;
}

export interface RevisionRow {
    revisionId: string;
    noteId: string;
    type: string;
    mime: string;
    isProtected: boolean;
    title: string;
    blobId: string;
    dateLastEdited: string;
    dateCreated: string;
    utcDateLastEdited: string;
    utcDateCreated: string;
    utcDateModified: string;
    contentLength?: number;
}

export interface RecentNoteRow {
    noteId: string;
    notePath: string;
    utcDateCreated?: string;
}

export interface OptionRow {
    name: string;
    value: string;
    isSynced: boolean;
    utcDateModified: string;
}

export interface EtapiTokenRow {
    etapiTokenId: string;
    name: string;
    tokenHash: string;
    utcDateCreated?: string;
    utcDateModified?: string;
    isDeleted: boolean;
}

export interface BlobRow {
    blobId: string;
    content: string | Buffer;
    contentLength: number;
    dateModified: string;
    utcDateModified: string;
}

export type AttributeType = "label" | "relation";

export interface AttributeRow {
    attributeId?: string;
    noteId: string;
    type: AttributeType;
    name: string;
    position: number;
    value: string;
    isInheritable: boolean;
    utcDateModified: string;
}

export interface BranchRow {
    branchId?: string;
    noteId: string;
    parentNoteId: string;
    prefix: string | null;
    notePosition: number;
    isExpanded: boolean;
    utcDateModified?: string;
}