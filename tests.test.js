import { supabase } from '../src/lib/supabase';
import * as JS from '../src/script/JoinSession';
import * as CS from '../src/script/CreateSession';
import * as LG from '../src/script/Login';

jest.mock('../src/lib/supabase', () => ({
supabase: { from: jest.fn() }
}));

test("generate 6 char long code", () => {expect(JS.generateCode()).toBe(length(6));});


