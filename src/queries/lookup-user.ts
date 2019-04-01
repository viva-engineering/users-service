
import { tables } from '../database';
import { SelectQuery, SelectQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format } from 'mysql';
import { db } from '../database';

export interface LookupUserByEmailRecord {
	id: number;
	email: string;
}

export interface LookUserByEmailParams {
	email: string;
}

export class LookupUserByEmailQuery extends SelectQuery<LookUserByEmailParams, LookupUserByEmailRecord> {
	protected readonly prepared: string;

	constructor() {
		super();

		const template = `
			select id, email
			from ??
			where email = ?
		`;

		this.prepared = format(template, [
			tables.users,
			raw('?')
		]);
	}

	compile({ email }: LookUserByEmailParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	toString() {
		return 'select id, email from users where email = ?';
	}

	async run(params: LookUserByEmailParams) : Promise<LookupUserByEmailRecord[]> {
		const result = await db.query(this, params) as SelectQueryResult<LookupUserByEmailRecord>;

		return result.results;
	}
}
