package com.smartcampus.connect;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import com.smartcampus.connect.fragments.GenericRoleFragment;

public class GenericRoleAdapter extends FragmentStateAdapter {

    private final int count;
    private final String role;

    public GenericRoleAdapter(@NonNull FragmentActivity fa, int count, String role) {
        super(fa);
        this.count = count;
        this.role = role;
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        return GenericRoleFragment.newInstance(position, role);
    }

    @Override
    public int getItemCount() { return count; }
}
